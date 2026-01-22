
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function inspectDb() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('--- Database Inspection ---');
    for (const row of tablesRes.rows) {
      const countRes = await pool.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`Table: ${row.table_name} | Count: ${countRes.rows[0].count}`);
      
      if (row.table_name === 'admin_users') {
        const users = await pool.query('SELECT username, email, role FROM admin_users');
        console.log('Users:', users.rows);
      }
      if (row.table_name === 'payments') {
        const payments = await pool.query('SELECT * FROM payments');
        console.log('Payments:', payments.rows);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

inspectDb();
