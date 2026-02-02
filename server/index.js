
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both root and server directories
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Render
app.set('trust proxy', 1);

const allowedOrigins = [
  'https://paylang.moonderiv.com',
  'https://www.paylang.moonderiv.com',
  'https://paylang-tusk.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000'
];

// CORS Middleware - MUST BE FIRST
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      console.log('CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

app.get('/ping', (req, res) => res.send('pong'));

// Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Email Transporter - Simplified for Render.com compatibility
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Skip transporter.verify() on startup as it can cause ETIMEDOUT during Render's boot cycle
console.log('Email Transporter initialized with service: gmail');

// --- PUBLIC ROUTES ---

// Public Settings
app.get('/api/settings', async (req, res) => {
  console.log('Fetching public settings...');
  try {
    const result = await pool.query('SELECT key, value FROM admin_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    // Ensure defaults if not in DB
    const finalSettings = {
      company_name: settings.company_name || 'Direct Settlement',
      service_name: settings.service_name || 'System Protocol',
      ...settings
    };
    res.json(finalSettings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api', limiter);

// Payment Verification (Webhook/Callback)
app.post('/api/verify-payment', async (req, res) => {
  console.log('Incoming verification request:', req.body);
  const { reference, email, amount, name } = req.body;
  
  if (!reference || !email) {
    console.error('Missing required fields in verification request');
    return res.status(400).json({ error: 'Missing reference or email' });
  }

  // Ensure amount is a valid number for the numeric column
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
    console.error('Invalid amount received:', amount);
    return res.status(400).json({ error: 'Invalid amount format' });
  }

  try {
    // 1. Check if already recorded
    const checkRes = await pool.query('SELECT id FROM payments WHERE reference = $1', [reference]);
    let alreadyRecorded = false;
    if (checkRes.rows.length > 0) {
      console.log('Payment already recorded in database.');
      alreadyRecorded = true;
    }

    // 2. Verify with Paystack (Always verify to ensure integrity before sending email)
    console.log('Verifying reference with Paystack:', reference);
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('PAYSTACK_SECRET_KEY not set in environment');
      return res.status(500).json({ error: 'Payment gateway configuration error' });
    }

    const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    const paystackData = paystackRes.data.data;
    console.log('Paystack verification response status:', paystackData.status);

    if (paystackData.status !== 'success') {
      console.error('Paystack verification failed. Status:', paystackData.status);
      return res.status(400).json({ error: `Payment verification failed: ${paystackData.status}` });
    }

    // 3. Verify Amount (Paystack amount is in subunits, e.g. cents/kobo)
    const expectedAmountInSubunits = Math.round(numericAmount * 100);
    if (Math.abs(paystackData.amount - expectedAmountInSubunits) > 1) { // 1 subunit tolerance
      console.error('Amount mismatch:', { expected: expectedAmountInSubunits, received: paystackData.amount });
      return res.status(400).json({ error: 'Payment amount mismatch' });
    }

    // 4. Record payment if not already there
    if (!alreadyRecorded) {
      console.log('Recording verified payment in database...');
      await pool.query(
        'INSERT INTO payments (reference, email, amount, name, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())',
        [reference, email, numericAmount, name, 'success']
      );
      console.log('Payment recorded successfully');
    }

    // 5. Send/Resend Confirmation Email (Only if status is success)
    console.log(`Attempting to send confirmation email to: ${email}`);
    const frontendUrl = process.env.FRONTEND_URL || 'https://paylang.moonderiv.com';
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Payment Successful - Ref: ${reference}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #333333; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #000000; padding: 30px; text-align: center;">
            <h1 style="color: #10b981; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Transaction Verified</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Your settlement has been successfully processed and verified by our institutional gateway.</p>
            
            <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 13px; text-transform: uppercase;">Reference</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right;">${reference}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 13px; text-transform: uppercase;">Amount</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right; color: #10b981;">$${amount} USD</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #6b7280; font-size: 13px; text-transform: uppercase;">Status</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right;">VERIFIED</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${frontendUrl}/thank-you?ref=${reference}" 
                 style="background-color: #10b981; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                Access Official Receipt
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 40px; border-top: 1px solid #e5e7eb; pt-20;">
              This is an automated dispatch. For protocol adjustments or support, please visit your dashboard.
            </p>
          </div>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
            &copy; ${new Date().getFullYear()} Institutional Settlement Protocol
          </div>
        </div>
      `
    };
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (mailErr) {
      console.error('Email delivery failed:', mailErr);
      // We don't return error to client because the payment IS recorded
    }

    res.json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Single Payment by Reference (Public for Receipt)
app.get('/api/payment/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const result = await pool.query('SELECT * FROM payments WHERE reference = $1', [reference]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Customer Orders & Refunds
app.get('/api/customer/orders/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const payments = await pool.query('SELECT * FROM payments WHERE email = $1 ORDER BY "createdAt" DESC', [email]);
    const refunds = await pool.query('SELECT * FROM refunds WHERE email = $1 ORDER BY "createdAt" DESC', [email]);
    res.json({
      payments: payments.rows,
      refunds: refunds.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Get Payments for Refund Search
app.get('/api/payments/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query('SELECT * FROM payments WHERE email = $1 ORDER BY "createdAt" DESC', [email]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Submit Refund Request
app.post('/api/refund-request', async (req, res) => {
  const { reference, email, reason } = req.body;
  try {
    // Find payment id from reference
    const paymentRes = await pool.query('SELECT id FROM payments WHERE reference = $1', [reference]);
    if (paymentRes.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    
    const paymentId = paymentRes.rows[0].id;

    await pool.query(
      'INSERT INTO refunds ("paymentId", email, reason, status, "createdAt") VALUES ($1, $2, $3, $4, NOW())',
      [paymentId, email, reason, 'pending']
    );

    res.json({ status: 'success', message: 'Refund request submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// --- ADMIN ROUTES ---

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1 AND is_active = true', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Update last login
    await pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Settings
app.get('/api/admin/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM admin_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/settings', authenticateToken, async (req, res) => {
  const { key, value } = req.body;
  try {
    // Audit before update
    const oldRes = await pool.query('SELECT value FROM admin_settings WHERE key = $1', [key]);
    const oldValue = oldRes.rows.length > 0 ? oldRes.rows[0].value : null;

    await pool.query(
      'INSERT INTO admin_settings (key, value, updated_at, updated_by) VALUES ($1, $2, NOW(), $3) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW(), updated_by = $3',
      [key, value, req.user.id]
    );

    // Log Audit
    await pool.query(
      'INSERT INTO audit_logs (admin_id, action, entity_type, old_data, new_data, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [req.user.id, 'UPDATE_SETTING', 'settings', JSON.stringify({ [key]: oldValue }), JSON.stringify({ [key]: value })]
    );

    res.json({ message: 'Setting updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Admin Analytics
app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
  try {
    const period = req.query.period || 'days';
    
    // Basic summary
    const statsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(*) as total_transactions,
        COUNT(DISTINCT email) as unique_customers,
        (SELECT COUNT(*) FROM refunds) as total_refunds
      FROM payments WHERE status = 'success'
    `);

    const stats = statsRes.rows[0];
    const totalTransactions = parseInt(stats.total_transactions);
    const totalRefunds = parseInt(stats.total_refunds);
    const refundRate = totalTransactions > 0 ? ((totalRefunds / totalTransactions) * 100).toFixed(1) : 0;

    // Chart data
    const chartRes = await pool.query(`
      SELECT DATE_TRUNC('day', "createdAt") as date, SUM(amount) as amount, COUNT(*) as count
      FROM payments
      GROUP BY 1 ORDER BY 1 DESC LIMIT 30
    `);

    res.json({
      totalRevenue: parseFloat(stats.total_revenue),
      transactionCount: totalTransactions,
      uniqueCustomers: parseInt(stats.unique_customers),
      refundRate: refundRate,
      chartData: chartRes.rows.map(r => ({
        name: r.date.toISOString().split('T')[0],
        revenue: parseFloat(r.amount),
        transactions: parseInt(r.count)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Analytics failed' });
  }
});

// Admin Transactions
app.get('/api/admin/transactions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Admin Refunds
app.get('/api/admin/refunds', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT r.*, p.reference, p.amount FROM refunds r LEFT JOIN payments p ON r."paymentId" = p.id ORDER BY r."createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/admin/refunds/:id/approve', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE refunds SET status = $1, processed_at = NOW(), processed_by = $2 WHERE id = $3', ['approved', req.user.id, id]);
    res.json({ message: 'Refund approved' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

app.post('/api/admin/refunds/:id/reject', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE refunds SET status = $1, processed_at = NOW(), processed_by = $2 WHERE id = $3', ['rejected', req.user.id, id]);
    res.json({ message: 'Refund rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// Admin Users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, is_active, role, created_at, last_login FROM admin_users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/api/admin/users', authenticateToken, async (req, res) => {
  const { username, password, email, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admin_users (username, password_hash, email, role, is_active, created_at) VALUES ($1, $2, $3, $4, true, NOW())',
      [username, hash, email, role || 'admin']
    );
    res.json({ message: 'Admin created' });
  } catch (err) {
    res.status(500).json({ error: 'Creation failed' });
  }
});

app.post('/api/admin/users/:id/toggle', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE admin_users SET is_active = NOT is_active WHERE id = $1', [id]);
    res.json({ message: 'Status toggled' });
  } catch (err) {
    res.status(500).json({ error: 'Toggle failed' });
  }
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT a.*, u.username FROM audit_logs a LEFT JOIN admin_users u ON a.admin_id = u.id ORDER BY a.created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Admin Change Password
app.post('/api/admin/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const userRes = await pool.query('SELECT password_hash FROM admin_users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Serve Static Files (Vite build output)
const distPath = path.resolve(__dirname, '../dist');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// SPA Routing: Redirect all non-API requests to index.html
app.use((req, res) => {
  // If it's an API request that didn't match any route, return 404
  if (req.path.startsWith('/api')) {
    console.log(`Unmatched API request: ${req.method} ${req.path}`);
    return res.status(404).json({ 
      error: `API route not found: ${req.method} ${req.path}`,
      availableRoutes: [
        'GET /api/settings',
        'POST /api/verify-payment',
        'GET /api/payment/:reference',
        'GET /api/customer/orders/:email',
        'GET /api/payments/:email',
        'POST /api/refund-request',
        'POST /api/admin/login',
        'GET /api/admin/settings',
        'POST /api/admin/settings',
        'GET /api/admin/analytics',
        'GET /api/admin/transactions',
        'GET /api/admin/refunds',
        'GET /api/admin/users',
        'GET /api/admin/audit-logs'
      ]
    });
  }
  
  // Otherwise, serve the frontend
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  // Ensure CORS headers are present even on errors
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
