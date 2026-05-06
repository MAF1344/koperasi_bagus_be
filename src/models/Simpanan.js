import {pool} from '../config/database.js';

class Simpanan {
  // Create new simpanan
  static async create(simpananData) {
    const {user_id, jenis_simpanan, jumlah, tanggal_simpanan, keterangan} = simpananData;

    const [result] = await pool.query(
      `INSERT INTO simpanan 
        (user_id, jenis_simpanan, jumlah, tanggal_simpanan, keterangan) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, jenis_simpanan, jumlah, tanggal_simpanan, keterangan],
    );

    return result.insertId;
  }

  // Get all simpanan with user info
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        u.nama_lengkap AS nama_anggota,
        u.username,
        u.role
      FROM simpanan s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);

    return rows;
  }

  // Get simpanan by ID
  static async findById(id) {
    const [rows] = await pool.query(
      `
      SELECT 
        s.*,
        u.nama_lengkap AS nama_anggota,
        u.username,
        u.role
      FROM simpanan s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `,
      [id],
    );

    return rows[0];
  }

  // Get simpanan by user
  static async findByUser(userId) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM simpanan
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [userId],
    );

    return rows;
  }

  // Get simpanan by jenis
  static async findByJenis(jenis) {
    const [rows] = await pool.query(
      `
      SELECT 
        s.*,
        u.nama_lengkap AS nama_anggota,
        u.username
      FROM simpanan s
      JOIN users u ON s.user_id = u.id
      WHERE s.jenis_simpanan = ?
      ORDER BY s.created_at DESC
    `,
      [jenis],
    );

    return rows;
  }

  // Calculate total simpanan per user
  static async calculateTotalByUser(userId) {
    const [rows] = await pool.query(
      `
      SELECT 
        jenis_simpanan,
        SUM(jumlah) AS total
      FROM simpanan
      WHERE user_id = ?
      GROUP BY jenis_simpanan
    `,
      [userId],
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
    const [rows] = await pool.query(`
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
      total_transactions: 0,
    };

    rows.forEach((row) => {
      totals[row.jenis_simpanan] = {
        total: parseFloat(row.total),
        count: parseInt(row.count),
      };
      totals.grand_total += parseFloat(row.total);
      totals.total_transactions += parseInt(row.count);
    });

    return totals;
  }

  // Statistics global
  static async getStats() {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) AS total_anggota,
        COUNT(*) AS total_transaksi,
        COALESCE(SUM(jumlah), 0) AS total_simpanan,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'pokok' THEN jumlah END), 0) AS total_pokok,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'wajib' THEN jumlah END), 0) AS total_wajib,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'sukarela' THEN jumlah END), 0) AS total_sukarela
      FROM simpanan
    `);

    return stats[0];
  }

  // Statistics per user
  static async getStatsByUser(userId) {
    const [stats] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(jumlah), 0) AS total_simpanan,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'pokok' THEN jumlah END), 0) AS total_pokok,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'wajib' THEN jumlah END), 0) AS total_wajib,
        COALESCE(SUM(CASE WHEN jenis_simpanan = 'sukarela' THEN jumlah END), 0) AS total_sukarela,
        COUNT(*) AS total_transaksi
      FROM simpanan
      WHERE user_id = ?
    `,
      [userId],
    );

    return stats[0];
  }

  // Find by user and type
  static async findByUserAndType(userId, jenis) {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM simpanan
      WHERE user_id = ? AND jenis_simpanan = ?
    `,
      [userId, jenis],
    );

    return rows;
  }

  // Check if user has pokok
  static async hasPokok(userId) {
    const [rows] = await pool.query(
      `
      SELECT id 
      FROM simpanan 
      WHERE user_id = ? AND jenis_simpanan = 'pokok'
      LIMIT 1
    `,
      [userId],
    );

    return rows.length > 0;
  }

  // Delete simpanan
  static async delete(id) {
    const [result] = await pool.query(`DELETE FROM simpanan WHERE id = ?`, [id]);
    return result.affectedRows;
  }

  // Get recent simpanan
  static async getRecent(limit = 10) {
    const [rows] = await pool.query(
      `
      SELECT 
        s.*,
        u.nama_lengkap AS nama_anggota,
        u.username
      FROM simpanan s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT ?
    `,
      [limit],
    );

    return rows;
  }
}

export default Simpanan;
