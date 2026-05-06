// Buat file sementara: fix-angsuran.js
import pool from './config/database.js';
import Angsuran from './models/Angsuran.js';

async function fixExistingPinjaman() {
  try {
    // Ambil semua pinjaman dengan status approved atau lunas
    const [pinjamanList] = await pool.query(`
      SELECT id, kode_pinjaman, tenor_bulan, angsuran_perbulan, approved_at 
      FROM pinjaman 
      WHERE status IN ('approved', 'lunas')
    `);

    console.log(`Found ${pinjamanList.length} pinjaman that need schedules`);

    for (const pinjaman of pinjamanList) {
      // Cek apakah sudah ada angsuran
      const [existing] = await pool.query('SELECT COUNT(*) as count FROM angsuran_pinjaman WHERE pinjaman_id = ?', [pinjaman.id]);

      if (existing[0].count === 0) {
        console.log(`Generating schedule for ${pinjaman.kode_pinjaman}...`);
        await Angsuran.generateSchedule(pinjaman.id);
        console.log(`✓ Schedule created for ${pinjaman.kode_pinjaman}`);
      } else {
        console.log(`✗ Schedule already exists for ${pinjaman.kode_pinjaman}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixExistingPinjaman();
