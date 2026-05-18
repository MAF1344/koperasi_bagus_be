// resetDatabase.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Hash bcrypt untuk password "admin123"
const HASH_PASS = '$2b$10$N9qo8uLOickgx2ZMRZo5e.uYcQfO0Nqz3PaT78n.E6Zd9wH8d4D6a';

const run = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME,
  });

  console.log('🔄 Resetting database...');

  try {
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');

    // ------------------------------
    // DELETE ALL DATA
    // ------------------------------
    const tables = ['transaction_details', 'transactions', 'products', 'users'];

    for (const table of tables) {
      await db.execute('SET FOREIGN_KEY_CHECKS = 0');
      await db.execute('TRUNCATE TABLE transaction_details');
      await db.execute('TRUNCATE TABLE transactions');
      await db.execute('TRUNCATE TABLE products');
      await db.execute('TRUNCATE TABLE users');
      await db.execute('SET FOREIGN_KEY_CHECKS = 1');
      await db.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    }

    console.log('📁 Data deleted & AUTO_INCREMENT reset.');

    // ------------------------------
    // INSERT DEFAULT USERS (Seeder)
    // ------------------------------
    const seedQuery = `
      INSERT INTO users 
      (username, password, nama_lengkap, email, role, is_active, created_at, updated_at)
      VALUES
      ('superadmin', '${HASH_PASS}', 'Gugun Yanwar', 'gugun@koperasibagus.com', 'superadmin', 1, NOW(), NOW()),
      ('admin1', '${HASH_PASS}', 'Yumna', 'yumna@koperasibagus.com', 'admin', 1, NOW(), NOW()),
      ('admin2', '${HASH_PASS}', 'Ahmad Fatoni', 'ahmad@koperasibagus.com', 'admin', 1, NOW(), NOW()),
      ('pengunjung', '${HASH_PASS}', 'Pengunjung', 'pengunjung@koperasibagus.com', 'pengunjung', 1, NOW(), NOW());
    `;

    await db.execute(seedQuery);
    console.log('🌱 Seeder: Default users inserted.');

    await db.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ Database reset & seed complete!');
  } catch (err) {
    console.error('❌ ERROR:', err);
  } finally {
    db.end();
  }
};

run();
