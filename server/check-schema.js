
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

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position;
    `);
    
    console.log('--- Payments Table Schema ---');
    console.table(res.rows);

    const constraints = await pool.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      JOIN pg_class ON pg_class.oid = pg_constraint.conrelid
      WHERE relname = 'payments';
    `);
    console.log('--- Constraints ---');
    console.table(constraints.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
