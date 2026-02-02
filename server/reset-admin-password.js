import bcrypt from 'bcryptjs';
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

async function resetAdminPassword() {
  try {
    const newPassword = '@Dray101';
    const hash = await bcrypt.hash(newPassword, 10);

    console.log('Resetting admin password...');
    console.log('New password:', newPassword);
    console.log('Hash:', hash);

    // Update admin password
    const result = await pool.query(
      'UPDATE admin_users SET password_hash = $1 WHERE username = $2',
      [hash, 'admin']
    );

    console.log('✅ Password reset successfully!');
    console.log('Username: admin');
    console.log('Password: @Dray101');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

resetAdminPassword();
