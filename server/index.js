
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

const allowedOrigins = [
  'https://paylang.moonderiv.com',
  'https://paylang-tusk.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

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

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- PUBLIC ROUTES ---

// Public Settings
app.get('/api/settings', async (req, res) => {
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

// Payment Verification (Webhook/Callback)
app.post('/api/verify-payment', async (req, res) => {
  const { reference, email, amount, name } = req.body;
  try {
    // Record payment
    await pool.query(
      'INSERT INTO payments (reference, email, amount, name, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())',
      [reference, email, amount, name, 'success']
    );

    // Send Confirmation Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Payment Confirmation',
      text: `Hello ${name},\n\nYour payment of $${amount} (Ref: ${reference}) has been successfully processed.\n\nThank you.`
    };
    
    transporter.sendMail(mailOptions).catch(err => console.error('Email failed:', err));

    res.json({ status: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
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
        (SELECT COUNT(*) FROM admin_users) as total_admins
      FROM payments WHERE status = 'success'
    `);

    // Chart data (mocking the aggregation for simplicity, or we can do real group by)
    const chartRes = await pool.query(`
      SELECT DATE_TRUNC('day', "createdAt") as date, SUM(amount) as amount, COUNT(*) as count
      FROM payments
      GROUP BY 1 ORDER BY 1 DESC LIMIT 30
    `);

    res.json({
      summary: statsRes.rows[0],
      chartData: chartRes.rows.map(r => ({
        date: r.date.toISOString().split('T')[0],
        revenue: parseFloat(r.amount),
        transactions: parseInt(r.count)
      }))
    });
  } catch (err) {
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
    const result = await pool.query('SELECT r.*, p.reference FROM refunds r LEFT JOIN payments p ON r."paymentId" = p.id ORDER BY r."createdAt" DESC');
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
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Routing: Redirect all non-API requests to index.html
app.use((req, res, next) => {
  // If it's an API request that didn't match any route, return 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  // Otherwise, serve the frontend
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
