import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import cors from 'cors';
import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

dotenv.config();

console.log('Server starting...');
console.log('PAYSTACK_SECRET_KEY:', process.env.PAYSTACK_SECRET_KEY ? 'LOADED' : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'LOADED' : 'MISSING');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const allowedOrigins = [
    'https://paylang.moonderiv.com',
    'https://paylang-tusk.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
];

// Robust CORS configuration using the cors package
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.moonderiv.com');
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma'],
    credentials: true,
    optionsSuccessStatus: 204
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => req.method === 'OPTIONS'
});
app.use('/api/', limiter);

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10s connection timeout
    idleTimeoutMillis: 30000,
});

// Initialize Database Tables
const initDb = async () => {
    try {
        const client = await pool.connect();
        try {
            // Create admin_users first (other tables depend on it)
            await client.query(`
                CREATE TABLE IF NOT EXISTS admin_users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    role VARCHAR(20) DEFAULT 'admin',
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create payments table
            await client.query(`
                CREATE TABLE IF NOT EXISTS payments (
                    id SERIAL PRIMARY KEY,
                    reference TEXT UNIQUE NOT NULL,
                    email TEXT NOT NULL,
                    name TEXT NOT NULL,
                    amount DECIMAL(12,2) NOT NULL,
                    status TEXT DEFAULT 'success',
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create refunds table (depends on admin_users and payments)
            await client.query(`
                CREATE TABLE IF NOT EXISTS refunds (
                    id SERIAL PRIMARY KEY,
                    "paymentId" INTEGER NOT NULL,
                    email TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    refund_amount DECIMAL(12,2),
                    processed_by INTEGER REFERENCES admin_users(id),
                    processed_at TIMESTAMP,
                    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY ("paymentId") REFERENCES payments(id)
                )
            `);

            // Create admin_settings table
            await client.query(`
                CREATE TABLE IF NOT EXISTS admin_settings (
                    id SERIAL PRIMARY KEY,
                    key VARCHAR(100) UNIQUE NOT NULL,
                    value TEXT,
                    updated_by INTEGER REFERENCES admin_users(id),
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create audit_logs table
            await client.query(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id SERIAL PRIMARY KEY,
                    admin_id INTEGER REFERENCES admin_users(id),
                    action VARCHAR(100) NOT NULL,
                    entity_type VARCHAR(50),
                    entity_id INTEGER,
                    old_data JSONB,
                    new_data JSONB,
                    ip_address VARCHAR(45),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Database initialized successfully');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Database initialization error:', err);
        // Don't throw here to allow server to start, but log it
    }
};

const setupServer = async () => {
    await initDb();
    await initializeDefaultAdmin();
};

setupServer();

// Middleware to protect admin routes
const authenticateAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Logging helper for audit trail
const logAuditAction = async (adminId, action, entityType, entityId, oldData = null, newData = null, ipAddress = null) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, old_data, new_data, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [adminId, action, entityType, entityId, oldData ? JSON.stringify(oldData) : null, newData ? JSON.stringify(newData) : null, ipAddress]
        );
    } catch (error) {
        console.error('Audit logging error:', error);
    }
};

// Helper to get all settings
const getSettingsMap = async () => {
    try {
        const result = await pool.query('SELECT key, value FROM admin_settings');
        const settings = {
            company_name: 'Service Platform',
            support_email: '',
            support_phone: '',
            notification_email: process.env.ADMIN_EMAIL || '',
            report_email: process.env.ADMIN_EMAIL || '',
            refund_policy_days: '14',
            max_refund_percentage: '100',
            timezone: 'UTC',
            service_name: 'Professional Services',
            service_description: 'High-quality professional support from industry experts.',
            landing_services: JSON.stringify([
                { title: "Strategic Consulting", desc: "Expert guidance to navigate complex business challenges and drive growth." },
                { title: "Professional Support", desc: "Dedicated assistance across multiple domains to ensure your operational success." },
                { title: "Specialized Solutions", desc: "Tailored approaches designed specifically for your unique industry requirements." }
            ]),
            landing_testimonials: JSON.stringify([
                { name: "Sarah J.", uni: "Director of Operations", quote: "The level of detail and professionalism exceeded our expectations. Truly exceptional!" },
                { name: "Michael L.", uni: "Senior Partner", quote: "Fast turnaround and very professional communication. Highly recommended for any business." },
                { name: "Elena R.", uni: "Project Lead", quote: "Helped us structure our entire project workflow. The quality of work was top-notch." }
            ])
        };
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        return settings;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { company_name: 'Service Platform' };
    }
};

// Admin Login - with database admin user
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        console.log('Login attempt for user:', username);
        // Check if admin user exists
        const adminRes = await pool.query(
            'SELECT id, username, password_hash, email, is_active, role FROM admin_users WHERE username = $1 AND is_active = true',
            [username]
        );

        if (adminRes.rows.length === 0) {
            console.log('Admin user not found:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = adminRes.rows[0];
        console.log('User found, verifying password...');
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query(
            'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [admin.id]
        );

        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET environment variable is missing!');
            return res.status(500).json({ error: 'Server configuration error: JWT_SECRET is missing' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful for:', username);
        res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
    } catch (error) {
        console.error('Detailed Login Error:', error);
        res.status(500).json({ 
            error: 'Server error during login', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
});

// Initialize default admin if none exists
const initializeDefaultAdmin = async () => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM admin_users');
        if (parseInt(result.rows[0].count) === 0) {
            const defaultPassword = '@Dray101';
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            
            await pool.query(
                `INSERT INTO admin_users (username, password_hash, email, role)
                 VALUES ($1, $2, $3, $4)`,
                ['admin', hashedPassword, 'support@moonderiv.com', 'admin']
            );
            
            console.log('Default admin created. Username: admin, Password: ' + defaultPassword);
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const getEmailTemplate = (name, amount, reference, companyName = 'Service Platform') => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #059669; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed</h1>
    </div>
    <div style="padding: 30px; background-color: white;">
        <p style="font-size: 16px; color: #334155;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Your payment has been successfully processed. Our team has been notified and will begin processing your request immediately.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 16px; font-weight: bold; text-align: right;">$${amount}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Reference:</td>
                    <td style="padding: 8px 0; color: #0f172a; font-size: 14px; text-align: right; font-family: monospace;">${reference}</td>
                </tr>
            </table>
        </div>

        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">A specialist will contact you via email within 2-4 hours. You can track your progress or provide additional information by replying to this email.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
    </div>
</div>
`;

const getRefundApprovedTemplate = (name, amount, companyName = 'Service Platform') => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #059669; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Refund Approved</h1>
    </div>
    <div style="padding: 30px; background-color: white;">
        <p style="font-size: 16px; color: #334155;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Good news! Your refund request for $${amount} has been approved and processed.</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">The funds should appear in your account within 5-10 business days, depending on your bank.</p>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
    </div>
</div>
`;

const getRefundRejectedTemplate = (name, reason, companyName = 'Service Platform') => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #ef4444; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Refund Request Update</h1>
    </div>
    <div style="padding: 30px; background-color: white;">
        <p style="font-size: 16px; color: #334155;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Your refund request has been reviewed and cannot be processed at this time.</p>
        ${reason ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;"><p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">If you have any questions, please reply to this email to speak with our support team.</p>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
    </div>
</div>
`;

const getAdminAlertTemplate = (name, email, amount, reference) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #1e293b; padding: 30px 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">New Sale Alert!</h2>
    </div>
    <div style="padding: 30px; background-color: white;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px 0; color: #64748b;">Customer:</td><td style="padding: 12px 0; color: #0f172a; font-weight: bold;">${name}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px 0; color: #64748b;">Email:</td><td style="padding: 12px 0; color: #0f172a;">${email}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px 0; color: #64748b;">Amount:</td><td style="padding: 12px 0; color: #059669; font-weight: bold;">$${amount}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px 0; color: #64748b;">Reference:</td><td style="padding: 12px 0; color: #0f172a; font-family: monospace;">${reference}</td></tr>
        </table>
        <div style="margin-top: 25px; text-align: center;">
            <a href="${process.env.VITE_BACKEND_URL || 'http://localhost:5000'}/admin" style="background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Dashboard</a>
        </div>
    </div>
</div>
`;

const getWeeklyReportTemplate = (stats, companyName = 'Service Platform') => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background-color: #1e293b; padding: 30px 20px; text-align: center;">
        <h2 style="color: white; margin: 0;">Weekly Revenue Report</h2>
        <p style="color: #94a3b8; margin: 5px 0 0 0;">${stats.startDate} to ${stats.endDate}</p>
    </div>
    <div style="padding: 30px; background-color: white;">
        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Total Revenue</p>
                <p style="color: #059669; font-size: 28px; margin: 0; font-weight: black;">$${stats.totalAmount}</p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Total Sales</p>
                <p style="color: #0f172a; font-size: 28px; margin: 0; font-weight: black;">${stats.totalCount}</p>
            </div>
        </div>

        <h3 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 15px;">Refund Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
                <td style="padding: 8px 0; color: #64748b;">Pending Requests:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: bold; text-align: right;">${stats.pendingRefunds}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b;">Approved Refunds:</td>
                <td style="padding: 8px 0; color: #ef4444; font-weight: bold; text-align: right;">$${stats.approvedRefundTotal}</td>
            </tr>
        </table>

        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.VITE_BACKEND_URL || 'http://localhost:5000'}/admin" style="background-color: #1e293b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Admin Dashboard</a>
        </div>
        
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} ${companyName}. Automated Weekly Analytics.</p>
        </div>
    </div>
</div>
`;

const sendWeeklyReport = async () => {
    try {
        console.log('Generating weekly report...');
        const settings = await getSettingsMap();
        if (!settings.report_email) {
            console.log('No report email configured, skipping weekly report.');
            return;
        }

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const statsQuery = await pool.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as total_amount,
                COUNT(*) as total_count,
                MIN("createdAt") as start_date,
                MAX("createdAt") as end_date
            FROM payments 
            WHERE status = 'success' AND "createdAt" >= $1
        `, [oneWeekAgo]);

        const refundQuery = await pool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                COALESCE(SUM(refund_amount) FILTER (WHERE status = 'approved'), 0) as approved_total
            FROM refunds 
            WHERE "createdAt" >= $1
        `, [oneWeekAgo]);

        const stats = {
            totalAmount: parseFloat(statsQuery.rows[0].total_amount).toFixed(2),
            totalCount: statsQuery.rows[0].total_count,
            startDate: statsQuery.rows[0].start_date ? new Date(statsQuery.rows[0].start_date).toLocaleDateString() : oneWeekAgo.toLocaleDateString(),
            endDate: new Date().toLocaleDateString(),
            pendingRefunds: refundQuery.rows[0].pending_count,
            approvedRefundTotal: parseFloat(refundQuery.rows[0].approved_total).toFixed(2)
        };

        const mailOptions = {
            from: `"${settings.company_name} Analytics" <${process.env.EMAIL_USER}>`,
            to: settings.report_email,
            subject: `Weekly Invoice & Revenue Report - ${settings.company_name}`,
            html: getWeeklyReportTemplate(stats, settings.company_name)
        };

        await transporter.sendMail(mailOptions);
        console.log('Weekly report sent to:', settings.report_email);
    } catch (error) {
        console.error('Error sending weekly report:', error);
    }
};

// Schedule weekly report (Every Sunday at midnight)
cron.schedule('0 0 * * 0', sendWeeklyReport);

// Admin Dashboard Routes (Protected)
app.get('/api/admin/transactions', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, reference, email, name, amount, status, "createdAt" FROM payments ORDER BY "createdAt" DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Admin transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch all transactions' });
    }
});

app.get('/api/admin/refunds', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.id, r."paymentId", r.email, r.reason, r.status, r.refund_amount, r."createdAt", r.processed_at,
                   p.reference as "paymentReference", p.amount as "originalAmount",
                   au.username as "processedBy"
            FROM refunds r 
            LEFT JOIN payments p ON r."paymentId" = p.id 
            LEFT JOIN admin_users au ON r.processed_by = au.id
            ORDER BY r."createdAt" DESC
        `);
        const formattedRefunds = result.rows.map(r => ({
            ...r,
            paymentId: { reference: r.paymentReference, originalAmount: r.originalAmount }
        }));
        res.json(formattedRefunds);
    } catch (error) {
        console.error('Admin refunds error:', error);
        res.status(500).json({ error: 'Failed to fetch all refunds' });
    }
});

// Process refund (approve)
app.post('/api/admin/refunds/:refundId/approve', authenticateAdmin, async (req, res) => {
    const { refundId } = req.params;
    const { refundAmount, notes } = req.body;

    try {
        const refundRes = await pool.query('SELECT * FROM refunds WHERE id = $1', [refundId]);
        if (refundRes.rows.length === 0) {
            return res.status(404).json({ error: 'Refund not found' });
        }

        const refund = refundRes.rows[0];
        const finalRefundAmount = refundAmount || (await pool.query(
            'SELECT amount FROM payments WHERE id = $1',
            [refund.paymentId]
        )).rows[0]?.amount;

        const oldData = refund;
        
        await pool.query(
            `UPDATE refunds 
             SET status = 'approved', processed_by = $1, processed_at = CURRENT_TIMESTAMP, refund_amount = $2
             WHERE id = $3`,
            [req.admin.id, finalRefundAmount, refundId]
        );

        await logAuditAction(req.admin.id, 'REFUND_APPROVED', 'refund', refundId, oldData, { status: 'approved', refund_amount: finalRefundAmount }, req.ip);

        // Send approval email
        const settings = await getSettingsMap();
        const paymentRes = await pool.query('SELECT email, name FROM payments WHERE id = $1', [refund.paymentId]);
        if (paymentRes.rows.length > 0) {
            const { email, name } = paymentRes.rows[0];
            const mailOptions = {
                from: `"${settings.company_name} Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Refund Approved - ${settings.company_name}`,
                html: getRefundApprovedTemplate(name, finalRefundAmount, settings.company_name)
            };
            transporter.sendMail(mailOptions).catch(e => console.error('Approval email failed:', e));
        }

        res.json({ status: 'success', message: 'Refund approved successfully' });
    } catch (error) {
        console.error('Refund approval error:', error);
        res.status(500).json({ error: 'Failed to approve refund' });
    }
});

// Reject refund
app.post('/api/admin/refunds/:refundId/reject', authenticateAdmin, async (req, res) => {
    const { refundId } = req.params;
    const { reason } = req.body;

    try {
        const refundRes = await pool.query('SELECT * FROM refunds WHERE id = $1', [refundId]);
        if (refundRes.rows.length === 0) {
            return res.status(404).json({ error: 'Refund not found' });
        }

        const oldData = refundRes.rows[0];
        
        await pool.query(
            `UPDATE refunds 
             SET status = 'rejected', processed_by = $1, processed_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [req.admin.id, refundId]
        );

        await logAuditAction(req.admin.id, 'REFUND_REJECTED', 'refund', refundId, oldData, { status: 'rejected' }, req.ip);

        // Send rejection email
        const settings = await getSettingsMap();
        const paymentRes = await pool.query('SELECT email, name FROM payments WHERE id = $1', [refundRes.rows[0].paymentId]);
        if (paymentRes.rows.length > 0) {
            const { email, name } = paymentRes.rows[0];
            const mailOptions = {
                from: `"${settings.company_name} Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Refund Request Update - ${settings.company_name}`,
                html: getRefundRejectedTemplate(name, reason, settings.company_name)
            };
            transporter.sendMail(mailOptions).catch(e => console.error('Email failed:', e));
        }

        res.json({ status: 'success', message: 'Refund rejected successfully' });
    } catch (error) {
        console.error('Refund rejection error:', error);
        res.status(500).json({ error: 'Failed to reject refund' });
    }
});

// Public settings for frontend
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await getSettingsMap();
        // Only expose public-safe settings
        const publicSettings = {
            company_name: settings.company_name,
            support_email: settings.support_email,
            support_phone: settings.support_phone,
            refund_policy_days: settings.refund_policy_days,
            service_name: settings.service_name,
            service_description: settings.service_description
        };
        res.json(publicSettings);
    } catch (error) {
        console.error('Public settings fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Get admin settings
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT key, value FROM admin_settings ORDER BY key');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Settings fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update admin settings
app.post('/api/admin/settings', authenticateAdmin, async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value required' });
    }

    try {
        await pool.query(
            `INSERT INTO admin_settings (key, value, updated_by)
             VALUES ($1, $2, $3)
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP`,
            [key, value, req.admin.id]
        );

        await logAuditAction(req.admin.id, 'SETTING_UPDATED', 'admin_settings', null, null, { key, value }, req.ip);

        res.json({ status: 'success', message: 'Setting updated' });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Change admin password
app.post('/api/admin/change-password', authenticateAdmin, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords required' });
    }

    try {
        const adminRes = await pool.query('SELECT password_hash FROM admin_users WHERE id = $1', [req.admin.id]);
        const isMatch = await bcrypt.compare(currentPassword, adminRes.rows[0].password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, req.admin.id]);
        
        await logAuditAction(req.admin.id, 'PASSWORD_CHANGED', 'admin_users', req.admin.id, null, null, req.ip);
        
        res.json({ status: 'success', message: 'Password changed successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Get audit logs
app.get('/api/admin/audit-logs', authenticateAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at, 
                   au.username as admin_username
            FROM audit_logs al
            LEFT JOIN admin_users au ON al.admin_id = au.id
            ORDER BY al.created_at DESC
            LIMIT 100
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

app.get('/api/admin/analytics', authenticateAdmin, async (req, res) => {
    const { period = 'days' } = req.query;
    try {
        const paymentsRes = await pool.query('SELECT id, reference, email, name, amount, status, "createdAt" FROM payments');
        const payments = paymentsRes.rows;
        const refundsCountRes = await pool.query('SELECT COUNT(*) as count FROM refunds');
        const refundsCount = parseInt(refundsCountRes.rows[0].count);
        const pendingRefundsRes = await pool.query("SELECT COUNT(*) as count FROM refunds WHERE status = 'pending'");
        const pendingRefunds = parseInt(pendingRefundsRes.rows[0].count);

        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalTransactions = payments.length;

        let chartData = [];
        const now = new Date();

        if (period === 'days') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dailyAmount = payments
                    .filter(p => new Date(p.createdAt).toISOString().startsWith(dateStr))
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                chartData.push({ label: dateStr, amount: dailyAmount });
            }
        } else if (period === 'weeks') {
            for (let i = 3; i >= 0; i--) {
                const start = new Date();
                start.setDate(start.getDate() - (i * 7 + 7));
                const end = new Date();
                end.setDate(end.getDate() - (i * 7));
                const weeklyAmount = payments
                    .filter(p => {
                        const pDate = new Date(p.createdAt);
                        return pDate >= start && pDate <= end;
                    })
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                chartData.push({ label: `Week ${4-i}`, amount: weeklyAmount });
            }
        } else if (period === 'months') {
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthName = d.toLocaleString('default', { month: 'short' });
                const monthYear = d.getFullYear();
                const monthlyAmount = payments
                    .filter(p => {
                        const pDate = new Date(p.createdAt);
                        return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
                    })
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                chartData.push({ label: `${monthName} ${monthYear}`, amount: monthlyAmount });
            }
        } else if (period === 'years') {
            for (let i = 2; i >= 0; i--) {
                const year = now.getFullYear() - i;
                const yearlyAmount = payments
                    .filter(p => new Date(p.createdAt).getFullYear() === year)
                    .reduce((sum, p) => sum + Number(p.amount), 0);
                chartData.push({ label: `${year}`, amount: yearlyAmount });
            }
        }

        const statusData = [
            { name: 'Completed', value: payments.length },
            { name: 'Refunds Pending', value: pendingRefunds },
            { name: 'Refunds Resolved', value: refundsCount - pendingRefunds }
        ];

        res.json({
            summary: {
                totalRevenue,
                totalTransactions,
                totalRefundRequests: refundsCount
            },
            dailyData: chartData,
            statusData
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Service Platform API with PostgreSQL is running' });
});

// Paystack Webhook Handler
app.post('/api/webhook/paystack', async (req, res) => {
    // Validate signature
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) {
        return res.sendStatus(400);
    }

    const event = req.body;
    res.sendStatus(200); // Acknowledge receipt quickly

    if (event.event === 'charge.success') {
        const { reference, customer, amount, metadata } = event.data;
        const email = customer.email;
        const name = metadata?.custom_fields?.[0]?.value || customer.first_name || 'Customer';
        const numericAmount = amount / 100; // Paystack sends amount in kobo

        try {
            // Check if payment already exists (to avoid duplicate from redirect verification)
            const existing = await pool.query('SELECT id FROM payments WHERE reference = $1', [reference]);
            if (existing.rows.length === 0) {
                await pool.query(
                    'INSERT INTO payments (reference, email, name, amount) VALUES ($1, $2, $3, $4)',
                    [reference, email.toLowerCase().trim(), name.trim(), numericAmount]
                );

                // Send emails
                const settings = await getSettingsMap();
                const mailOptions = {
                    from: `"${settings.company_name} Support" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `Payment Confirmation - ${settings.company_name}`,
                    html: getEmailTemplate(name, numericAmount, reference, settings.company_name)
                };

                const adminMailOptions = {
                    from: `"${settings.company_name} System" <${process.env.EMAIL_USER}>`,
                    to: settings.notification_email || process.env.ADMIN_EMAIL,
                    subject: '🔥 NEW SALE: $' + numericAmount,
                    html: getAdminAlertTemplate(name, email, numericAmount, reference)
                };

                transporter.sendMail(mailOptions).catch(e => console.error('Webhook customer email failed:', e));
                transporter.sendMail(adminMailOptions).catch(e => console.error('Webhook admin email failed:', e));
                
                console.log(`Webhook: Payment recorded for ${reference}`);
            }
        } catch (error) {
            console.error('Webhook processing error:', error);
        }
    }
});

app.post('/api/verify-payment', async (req, res) => {
    const { reference, email, amount, name } = req.body;

    // Robust Input Validation
    if (!reference || !email || !amount || !name) {
        return res.status(400).json({ status: 'failed', message: 'Missing required payment details' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ status: 'failed', message: 'Invalid email format' });
    }

    if (parseFloat(amount) <= 0) {
        return res.status(400).json({ status: 'failed', message: 'Invalid payment amount' });
    }

    try {
        // Check if payment already exists (e.g., recorded by webhook)
        const existing = await pool.query('SELECT id FROM payments WHERE reference = $1', [reference]);
        if (existing.rows.length > 0) {
            return res.json({ status: 'success', message: 'Payment already recorded' });
        }

        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        if (response.data.status && response.data.data.status === 'success') {
            const numericAmount = parseFloat(amount);
            
            await pool.query(
                'INSERT INTO payments (reference, email, name, amount) VALUES ($1, $2, $3, $4)',
                [reference, email.toLowerCase().trim(), name.trim(), numericAmount]
            );

            const settings = await getSettingsMap();
            const mailOptions = {
                from: `"${settings.company_name} Support" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `Payment Confirmation - ${settings.company_name}`,
                html: getEmailTemplate(name, numericAmount, reference, settings.company_name)
            };

            const adminMailOptions = {
                from: `"${settings.company_name} System" <${process.env.EMAIL_USER}>`,
                to: settings.notification_email || process.env.ADMIN_EMAIL,
                subject: '🔥 NEW SALE: $' + numericAmount,
                html: getAdminAlertTemplate(name, email, numericAmount, reference)
            };

            transporter.sendMail(mailOptions).catch(e => console.error('Customer email failed:', e));
            transporter.sendMail(adminMailOptions).catch(e => console.error('Admin email failed:', e));

            return res.json({ status: 'success', message: 'Payment verified and saved' });
        } else {
            return res.status(400).json({ status: 'failed', message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/api/payments/:email', async (req, res) => {
    const email = req.params.email.toLowerCase();
    try {
        const result = await pool.query(
            'SELECT id, reference, email, name, amount, status, "createdAt" FROM payments WHERE email = $1 ORDER BY "createdAt" DESC',
            [email]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Customer dashboard - get all orders for a customer
app.get('/api/customer/orders/:email', async (req, res) => {
    const email = req.params.email.toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
        const paymentsRes = await pool.query(
            'SELECT id, reference, email, name, amount, status, "createdAt" FROM payments WHERE email = $1 ORDER BY "createdAt" DESC',
            [email]
        );

        const refundsRes = await pool.query(
            'SELECT id, "paymentId", reason, status, "createdAt" FROM refunds WHERE email = $1 ORDER BY "createdAt" DESC',
            [email]
        );

        res.json({
            payments: paymentsRes.rows,
            refunds: refundsRes.rows
        });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get single order details
app.get('/api/customer/order/:reference', async (req, res) => {
    const { reference } = req.params;
    try {
        const paymentRes = await pool.query(
            'SELECT id, reference, email, name, amount, status, "createdAt" FROM payments WHERE reference = $1',
            [reference]
        );

        if (paymentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const payment = paymentRes.rows[0];

        const refundsRes = await pool.query(
            'SELECT id, reason, status, "createdAt" FROM refunds WHERE "paymentId" = $1 ORDER BY "createdAt" DESC',
            [payment.id]
        );

        res.json({
            payment,
            refunds: refundsRes.rows
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});

app.post('/api/refund-request', async (req, res) => {
    const { reference, email, reason } = req.body;
    try {
        const paymentRes = await pool.query('SELECT id FROM payments WHERE reference = $1', [reference]);
        const payment = paymentRes.rows[0];
        if (!payment) return res.status(404).json({ error: 'Payment reference not found' });

        await pool.query(
            'INSERT INTO refunds ("paymentId", email, reason) VALUES ($1, $2, $3)',
            [payment.id, email.toLowerCase(), reason]
        );

        const settings = await getSettingsMap();
        const adminMailOptions = {
            from: `"${settings.company_name} System" <${process.env.EMAIL_USER}>`,
            to: settings.notification_email || process.env.EMAIL_USER,
            subject: '⚠️ New Refund Request',
            text: `Refund request from: ${email}\nReason: ${reason}\nPayment Reference: ${reference}`
        };
        transporter.sendMail(adminMailOptions);

        res.json({ status: 'success', message: 'Refund appeal submitted successfully' });
    } catch (error) {
        console.error('Error submitting refund:', error);
        res.status(500).json({ error: 'Failed to submit refund request' });
    }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../dist')));

// Serve frontend for all other routes (SPA fallback)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    try {
        await initializeDefaultAdmin();
        console.log(`Server running on port ${PORT} with PostgreSQL & Auth`);
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        process.exit(1);
    }
});
