import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import axios from 'axios';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../dist')));

// SQLite Connection
const db = new Database('tutorflow.db');

// Initialize Database Tables
db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'success',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refunds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paymentId INTEGER NOT NULL,
        email TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (paymentId) REFERENCES payments(id)
    );
`);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Admin Dashboard Routes
app.get('/api/admin/transactions', (req, res) => {
    console.log('Admin: Fetching transactions');
    try {
        const payments = db.prepare('SELECT * FROM payments ORDER BY createdAt DESC').all();
        res.json(payments);
    } catch (error) {
        console.error('Admin transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch all transactions' });
    }
});

app.get('/api/admin/refunds', (req, res) => {
    console.log('Admin: Fetching refunds');
    try {
        const refunds = db.prepare(`
            SELECT r.*, p.reference as paymentReference 
            FROM refunds r 
            LEFT JOIN payments p ON r.paymentId = p.id 
            ORDER BY r.createdAt DESC
        `).all();
        
        // Format to match frontend expectation (populate simulation)
        const formattedRefunds = refunds.map(r => ({
            ...r,
            paymentId: { reference: r.paymentReference }
        }));
        
        res.json(formattedRefunds);
    } catch (error) {
        console.error('Admin refunds error:', error);
        res.status(500).json({ error: 'Failed to fetch all refunds' });
    }
});

app.get('/api/admin/analytics', (req, res) => {
    console.log('Admin: Fetching analytics');
    const { period = 'days' } = req.query;
    
    try {
        const payments = db.prepare('SELECT * FROM payments').all();
        const refundsCount = db.prepare('SELECT COUNT(*) as count FROM refunds').get().count;
        const pendingRefunds = db.prepare("SELECT COUNT(*) as count FROM refunds WHERE status = 'pending'").get().count;

        // Basic stats
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalTransactions = payments.length;

        // Group data based on period
        let chartData = [];
        const now = new Date();

        if (period === 'days') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dailyAmount = payments
                    .filter(p => p.createdAt.startsWith(dateStr))
                    .reduce((sum, p) => sum + p.amount, 0);
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
                    .reduce((sum, p) => sum + p.amount, 0);
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
                    .reduce((sum, p) => sum + p.amount, 0);
                chartData.push({ label: `${monthName} ${monthYear}`, amount: monthlyAmount });
            }
        } else if (period === 'years') {
            for (let i = 2; i >= 0; i--) {
                const year = now.getFullYear() - i;
                const yearlyAmount = payments
                    .filter(p => new Date(p.createdAt).getFullYear() === year)
                    .reduce((sum, p) => sum + p.amount, 0);
                chartData.push({ label: `${year}`, amount: yearlyAmount });
            }
        }

        // Group by status for pie chart
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
    res.json({ status: 'ok', message: 'TutorFlow API with SQLite is running' });
});

app.post('/api/verify-payment', async (req, res) => {
    const { reference, email, amount, name } = req.body;

    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        if (response.data.status && response.data.data.status === 'success') {
            const stmt = db.prepare('INSERT INTO payments (reference, email, name, amount) VALUES (?, ?, ?, ?)');
            stmt.run(reference, email.toLowerCase(), name, amount);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Payment Confirmation - TutorFlow',
                text: `Dear ${name},\n\nYour payment of $${amount} has been successfully received.\n\nTransaction Reference: ${reference}\n\nBest regards,\nTutorFlow Team`
            };

            const adminMailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: 'NEW PAYMENT RECEIVED - TutorFlow',
                text: `Admin Alert,\n\nA new payment has been processed successfully.\n\nDetails:\nName: ${name}\nEmail: ${email}\nAmount: $${amount}\nReference: ${reference}\n\nView details in the Admin Dashboard.`
            };

            transporter.sendMail(mailOptions);
            transporter.sendMail(adminMailOptions);
            return res.json({ status: 'success', message: 'Payment verified and saved' });
        } else {
            return res.status(400).json({ status: 'failed', message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.get('/api/payments/:email', (req, res) => {
    const email = req.params.email.toLowerCase();
    try {
        const payments = db.prepare('SELECT * FROM payments WHERE email = ? ORDER BY createdAt DESC').all(email);
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

app.post('/api/refund-request', (req, res) => {
    const { reference, email, reason } = req.body;
    try {
        // Find payment by reference
        const payment = db.prepare('SELECT id FROM payments WHERE reference = ?').get(reference);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment reference not found' });
        }

        const stmt = db.prepare('INSERT INTO refunds (paymentId, email, reason) VALUES (?, ?, ?)');
        stmt.run(payment.id, email.toLowerCase(), reason);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'New Refund Request Received',
            text: `Refund request from: ${email}\nReason: ${reason}\nPayment Reference: ${reference}`
        };
        transporter.sendMail(mailOptions);

        res.json({ status: 'success', message: 'Refund appeal submitted successfully' });
    } catch (error) {
        console.error('Error submitting refund:', error);
        res.status(500).json({ error: 'Failed to submit refund request' });
    }
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with SQLite`);
});
