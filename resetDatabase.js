// resetDatabase.js
// Purpose:
// - Reset data only (truncate tables, keep schema intact)
// - Do NOT change table structure here
// - If you need structural changes, update the SQL schema in src/config/supabase_schema.sql
//   and then run that SQL manually in pgAdmin / psql.

import dotenv from 'dotenv';
import { pool } from './src/config/database.js';
import { hashPassword } from './src/utils/helpers.js';

dotenv.config();

// Daftar tabel yang akan di-reset.
// Kalau struktur database berkembang (contoh menambah tabel anggota/siswa),
// tambahkan nama tabel di sini agar script tetap bisa mereset isinya.
const TABLES_TO_RESET = [
  'bagi_hasil_anggota',
  'saldo_koperasi',
  'transaction_details',
  'transactions',
  'products',
  'simpanan',
  'angsuran_pinjaman',
  'pinjaman',
  'siswa',
  'anggota',
  'users',
];

const DEFAULT_USERS = [
  {
    username: 'superadmin',
    email: 'gugun@koperasibagus.com',
    password: 'admin123',
    nama_lengkap: 'Gugun Yanwar',
    role: 'superadmin',
  },
  {
    username: 'admin1',
    email: 'yumna@koperasibagus.com',
    password: 'admin123',
    nama_lengkap: 'Yumna',
    role: 'admin',
  },
  {
    username: 'admin2',
    email: 'ahmad@koperasibagus.com',
    password: 'admin123',
    nama_lengkap: 'Ahmad Fatoni',
    role: 'admin',
  },
  {
    username: 'pengunjung',
    email: 'pengunjung@koperasibagus.com',
    password: 'admin123',
    nama_lengkap: 'Pengunjung',
    role: 'pengunjung',
  },
];

const seedDefaultUsers = async () => {
  const inserted = [];

  for (const user of DEFAULT_USERS) {
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);
    if (existing.rowCount > 0) {
      continue;
    }

    const hashedPassword = await hashPassword(user.password);
    await pool.query(
      `INSERT INTO users (username, email, password, nama_lengkap, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())`,
      [user.username, user.email, hashedPassword, user.nama_lengkap, user.role],
    );

    inserted.push(user.username);
  }

  return inserted;
};

const resetDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Resetting data only...');
    await client.query('BEGIN');
    await client.query(`TRUNCATE TABLE ${TABLES_TO_RESET.join(', ')} RESTART IDENTITY CASCADE`);
    await client.query('COMMIT');

    console.log('📁 Data deleted and identity sequences reset.');

    const insertedUsers = await seedDefaultUsers();
    if (insertedUsers.length > 0) {
      console.log('🌱 Seeded default users:', insertedUsers.join(', '));
    } else {
      console.log('🌱 No default users inserted (users already existed).');
    }

    console.log('✅ Data reset complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Reset failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
  }
};

resetDatabase();
