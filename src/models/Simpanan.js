import {pool} from '../config/database.js';

class Simpanan {
  // Create new simpanan
  static async create(simpananData) {
    const {anggota_id, user_id, jenis_simpanan, jumlah, tanggal_simpanan, keterangan} = simpananData;

    const {rows} = await pool.query(
      `INSERT INTO simpanan 
        (anggota_id, user_id, jenis_simpanan, jumlah, tanggal_simpanan, keterangan) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [anggota_id, user_id || null, jenis_simpanan, jumlah, tanggal_simpanan, keterangan],
    );

    return rows[0].id;
  }

  // Get all simpanan with anggota info
  static async findAll() {
    const {rows} = await pool.query(`
      SELECT 
        s.*,
        a.id as anggota_id,
        a.nomor_anggota,
        a.nama_lengkap as anggota_nama,
        a.status as anggota_status
      FROM simpanan s
      LEFT JOIN anggota a ON s.anggota_id = a.id
      ORDER BY s.created_at DESC
    `);

    return rows;
  }

  // Get simpanan by ID
  static async findById(id) {
    const {rows} = await pool.query(
      `
      SELECT 
        s.*,
        a.id as anggota_id,
        a.nomor_anggota,
        a.nama_lengkap as anggota_nama,
        a.status as anggota_status
      FROM simpanan s
      LEFT JOIN anggota a ON s.anggota_id = a.id
      WHERE s.id = $1
    `,
      [id],
    );

    return rows[0];
  }

  // Get simpanan by anggota
  static async findByAnggota(anggotaId) {
    const {rows} = await pool.query(
      `
      SELECT s.*, a.id as anggota_id, a.nomor_anggota, a.nama_lengkap as anggota_nama, a.status as anggota_status
      FROM simpanan s
      LEFT JOIN anggota a ON s.anggota_id = a.id
      WHERE s.anggota_id = $1
      ORDER BY s.created_at DESC
    `,
      [anggotaId],
    );

    return rows;
  }

  // Get simpanan by jenis
  static async findByJenis(jenis) {
    const {rows} = await pool.query(
      `
      SELECT s.*, a.id as anggota_id, a.nomor_anggota, a.nama_lengkap as anggota_nama, a.status as anggota_status
      FROM simpanan s
      LEFT JOIN anggota a ON s.anggota_id = a.id
      WHERE s.jenis_simpanan = $1
      ORDER BY s.created_at DESC
    `,
      [jenis],
    );

    return rows;
  }

  // Calculate total simpanan per anggota
  static async calculateTotalByAnggota(anggotaId) {
    const {rows} = await pool.query(
      `
      SELECT 
        jenis_simpanan,
        SUM(jumlah) AS total
      FROM simpanan
      WHERE anggota_id = $1
      GROUP BY jenis_simpanan
    `,
      [anggotaId],
    );

    const totals = {
      pokok: 0,
      wajib: 0,
      sukarela: 0,
      grand_total: 0,
    };

    rows.forEach((row) => {
      totals[row.jenis_simpanan] = parseFloat(row.total);
      totals.grand_total += parseFloat(row.total);
    });

    return totals;
  }

  // Calculate all simpanan totals
  static async calculateTotalAll() {
    const {rows} = await pool.query(`
      SELECT 
        jenis_simpanan,
        SUM(jumlah) AS total,
        COUNT(*) AS count
      FROM simpanan
      GROUP BY jenis_simpanan
    `);

    const totals = {
      pokok: {total: 0, count: 0},
      wajib: {total: 0, count: 0},
      sukarela: {total: 0, count: 0},
      grand_total: 0,
      total_transaksi: 0,
    };

    rows.forEach((row) => {
      totals[row.jenis_simpanan] = {
        total: parseFloat(row.total),
        count: parseInt(row.count),
      };
      totals.grand_total += parseFloat(row.total);
      totals.total_transaksi += parseInt(row.count);
    });

    return totals;
  }

  // Statistics global
  static async getStats() {
    const {rows} = await pool.query(`
      SELECT 
        COUNT(DISTINCT anggota_id) AS total_anggota,
        COUNT(*) AS total_transaksi,
        COALESCE(SUM(jumlah), 0) AS total_simpanan,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'pokok' THEN jumlah END), 0) AS total_pokok,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'wajib' THEN jumlah END), 0) AS total_wajib,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'sukarela' THEN jumlah END), 0) AS total_sukarela
      FROM simpanan
    `);

    return rows[0];
  }

  // Statistics per anggota
  static async getStatsByAnggota(anggotaId) {
    const {rows} = await pool.query(
      `
      SELECT 
        COALESCE(SUM(jumlah), 0) AS total_simpanan,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'pokok' THEN jumlah END), 0) AS total_pokok,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'wajib' THEN jumlah END), 0) AS total_wajib,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'sukarela' THEN jumlah END), 0) AS total_sukarela,
        COUNT(*) AS total_transaksi
      FROM simpanan
      WHERE anggota_id = $1
    `,
      [anggotaId],
    );

    return rows[0];
  }

  // Find by anggota and type
  static async findByAnggotaAndType(anggotaId, jenis) {
    const {rows} = await pool.query(
      `
      SELECT *
      FROM simpanan
      WHERE anggota_id = $1 AND jenis_simpanan = $2
    `,
      [anggotaId, jenis],
    );

    return rows;
  }

  // Check if anggota has pokok
  static async hasPokok(anggotaId) {
    const {rows} = await pool.query(
      `
      SELECT id 
      FROM simpanan 
      WHERE anggota_id = $1 AND jenis_simpanan = 'pokok'
      LIMIT 1
    `,
      [anggotaId],
    );

    return rows.length > 0;
  }

  // Delete simpanan
  static async delete(id) {
    const result = await pool.query(`DELETE FROM simpanan WHERE id = $1`, [id]);
    return result.rowCount;
  }

  // Get recent simpanan
  static async getRecent(limit = 10) {
    const {rows} = await pool.query(
      `
      SELECT 
        s.*,
        a.id as anggota_id,
        a.nomor_anggota,
        a.nama_lengkap as anggota_nama,
        a.status as anggota_status
      FROM simpanan s
      LEFT JOIN anggota a ON s.anggota_id = a.id
      ORDER BY s.created_at DESC
      LIMIT $1
    `,
      [limit],
    );

    return rows;
  }
}

export default Simpanan;
