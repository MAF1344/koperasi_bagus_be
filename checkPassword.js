// File: backend/checkPassword.js
// Script untuk cek apakah password hash di database valid

import bcrypt from 'bcryptjs';
import {pool} from './src/config/database.js';

const checkPasswords = async () => {
  try {
    console.log('\n=== PASSWORD VERIFICATION ===\n');

    // Get users from database
    const [users] = await pool.query('SELECT username, password FROM users');

    const testPasswords = {
      superadmin: 'admin123',
      admin1: 'admin123',
      pengunjung: 'pengunjung123',
    };

    for (const user of users) {
      console.log(`\n--- User: ${user.username} ---`);
      console.log(`Password hash: ${user.password.substring(0, 30)}...`);
      console.log(`Hash length: ${user.password.length} chars`);
      console.log(`Hash starts with: ${user.password.substring(0, 7)}`);

      const testPassword = testPasswords[user.username] || 'admin123';
      console.log(`Testing password: ${testPassword}`);

      try {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`Result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

        if (!isValid) {
          // Generate correct hash
          const correctHash = await bcrypt.hash(testPassword, 10);
          console.log(`\n🔧 Correct hash for "${testPassword}":`);
          console.log(`UPDATE users SET password = '${correctHash}' WHERE username = '${user.username}';`);
        }
      } catch (err) {
        console.log(`❌ Error comparing: ${err.message}`);
      }
    }

    console.log('\n=== END VERIFICATION ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPasswords();
