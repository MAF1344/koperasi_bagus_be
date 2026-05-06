import {pool} from '../config/database.js';

const Pinjaman = {
  /*
  |--------------------------------------------------------------------------
  | Generate kode pinjaman otomatis (PJM-001)
  |--------------------------------------------------------------------------
  */
  generateKodePinjaman: async () => {
    const [rows] = await pool.query(`
      SELECT kode_pinjaman 
      FROM pinjaman 
      ORDER BY id DESC 
      LIMIT 1
    `);

    let next = 1;

    if (rows.length > 0) {
      const last = rows[0].kode_pinjaman; // contoh: PJM-001
      next = parseInt(last.split('-')[1]) + 1;
    }

    return `PJM-${String(next).padStart(3, '0')}`;
  },

  /*
  |--------------------------------------------------------------------------
  | Create new pinjaman
  |--------------------------------------------------------------------------
  */
  create: async (data) => {
    const {user_id, jumlah_pinjaman, tenor_bulan, keterangan} = data;

    // Generate kode otomatis
    const kode_pinjaman = await Pinjaman.generateKodePinjaman();

    // Hitung bunga dari persentase (default 0%)
    const bunga_persen = 0;
    const jumlah_bunga = (parseFloat(jumlah_pinjaman) * bunga_persen) / 100;
    const total_pinjaman = parseFloat(jumlah_pinjaman) + jumlah_bunga;
    const angsuran_perbulan = total_pinjaman / parseInt(tenor_bulan);

    const tanggal_pinjaman = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(
      `
    INSERT INTO pinjaman (
      kode_pinjaman, user_id, jumlah_pinjaman, 
      bunga_persen, total_pinjaman, tenor_bulan, angsuran_perbulan,
      sisa_pinjaman, tanggal_pinjaman, status, keterangan
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `,
      [
        kode_pinjaman,
        user_id,
        jumlah_pinjaman,
        bunga_persen,
        total_pinjaman,
        tenor_bulan,
        angsuran_perbulan,
        total_pinjaman, // sisa awal = total
        tanggal_pinjaman,
        keterangan,
      ],
    );

    return {
      id: result.insertId,
      kode_pinjaman,
    };
  },

  /*
  |--------------------------------------------------------------------------
  | Get all pinjaman
  |--------------------------------------------------------------------------
  */
  findAll: async () => {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        u.nama_lengkap AS nama_peminjam,
        u.username,
        u.role,
        a.nama_lengkap AS approved_by_name
      FROM pinjaman p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN users a ON p.approved_by = a.id
      ORDER BY p.created_at DESC
    `);

    return rows;
  },

  /*
  |--------------------------------------------------------------------------
  | Get pinjaman by ID
  |--------------------------------------------------------------------------
  */
  findById: async (id) => {
    const [rows] = await pool.query(
      `
      SELECT 
        p.*,
        u.nama_lengkap AS nama_peminjam,
        u.username,
        u.role,
        u.email,
        a.nama_lengkap AS approved_by_name
      FROM pinjaman p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN users a ON p.approved_by = a.id
      WHERE p.id = ?
      `,
      [id],
    );

    return rows[0];
  },

  /*
  |--------------------------------------------------------------------------
  | Get pinjaman by user
  |--------------------------------------------------------------------------
  */
  findByUser: async (userId) => {
    const [rows] = await pool.query(
      `
      SELECT 
        p.*,
        a.nama_lengkap AS approved_by_name
      FROM pinjaman p
      LEFT JOIN users a ON p.approved_by = a.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      `,
      [userId],
    );

    return rows;
  },

  /*
  |--------------------------------------------------------------------------
  | Get pinjaman by status
  |--------------------------------------------------------------------------
  */
  findByStatus: async (status) => {
    const [rows] = await pool.query(
      `
      SELECT 
        p.*,
        u.nama_lengkap AS nama_peminjam,
        u.username,
        a.nama_lengkap AS approved_by_name
      FROM pinjaman p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN users a ON p.approved_by = a.id
      WHERE p.status = ?
      ORDER BY p.created_at DESC
      `,
      [status],
    );

    return rows;
  },

  /*
  |--------------------------------------------------------------------------
  | Cek pinjaman user berdasarkan status
  |--------------------------------------------------------------------------
  */
  findByUserAndStatus: async (userId, status) => {
    const [rows] = await pool.query(`SELECT * FROM pinjaman WHERE user_id = ? AND status = ?`, [userId, status]);
    return rows;
  },

  /*
  |--------------------------------------------------------------------------
  | Approve pinjaman
  |--------------------------------------------------------------------------
  */
  approve: async (id, approvedBy, keterangan = null) => {
    const approved_at = new Date();

    const [result] = await pool.query(
      `
      UPDATE pinjaman
      SET 
        status = 'approved',
        approved_by = ?,
        approved_at = ?,
        keterangan = ?
      WHERE id = ?
    `,
      [approvedBy, approved_at, keterangan, id],
    );

    return result.affectedRows;
  },

  /*
  |--------------------------------------------------------------------------
  | Reject pinjaman
  |--------------------------------------------------------------------------
  */
  reject: async (id, approvedBy, keterangan = null) => {
    const approved_at = new Date();

    const [result] = await pool.query(
      `
      UPDATE pinjaman
      SET 
        status = 'rejected',
        approved_by = ?,
        approved_at = ?,
        keterangan = ?
      WHERE id = ?
    `,
      [approvedBy, approved_at, keterangan, id],
    );

    return result.affectedRows;
  },

  /*
  |--------------------------------------------------------------------------
  | Mark as Lunas
  |--------------------------------------------------------------------------
  */
  markAsLunas: async (id) => {
    const [result] = await pool.query(`UPDATE pinjaman SET status = 'lunas' WHERE id = ?`, [id]);
    return result.affectedRows;
  },

  /*
  |--------------------------------------------------------------------------
  | Get Statistics
  |--------------------------------------------------------------------------
  */
  getStats: async () => {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_pinjaman,
        SUM(status = 'pending') AS pending,
        SUM(status = 'approved') AS approved,
        SUM(status = 'rejected') AS rejected,
        SUM(status = 'lunas') AS lunas,
        SUM(CASE WHEN status = 'approved' THEN jumlah_pinjaman ELSE 0 END) AS total_approved_amount,
        SUM(CASE WHEN status = 'lunas' THEN jumlah_pinjaman ELSE 0 END) AS total_lunas_amount
      FROM pinjaman
    `);

    return stats[0];
  },

  /*
  |--------------------------------------------------------------------------
  | Hitung sisa pinjaman
  |--------------------------------------------------------------------------
  */
  calculateRemainingBalance: async (pinjamanId) => {
    const [rows] = await pool.query(
      `
      SELECT 
        p.total_pinjaman,
        COALESCE(SUM(a.jumlah_bayar), 0) AS total_dibayar
      FROM pinjaman p
      LEFT JOIN angsuran a 
        ON p.id = a.pinjaman_id 
       AND a.status = 'lunas'
      WHERE p.id = ?
      GROUP BY p.id
      `,
      [pinjamanId],
    );

    if (rows.length === 0) return null;

    const {total_pinjaman, total_dibayar} = rows[0];

    return {
      total_pinjaman: parseFloat(total_pinjaman),
      total_dibayar: parseFloat(total_dibayar),
      sisa: parseFloat(total_pinjaman) - parseFloat(total_dibayar),
    };
  },

  /*
  |--------------------------------------------------------------------------
  | Delete pinjaman (hanya pending)
  |--------------------------------------------------------------------------
  */
  delete: async (id) => {
    const [result] = await pool.query(`DELETE FROM pinjaman WHERE id = ? AND status = 'pending'`, [id]);
    return result.affectedRows;
  },
};

export default Pinjaman;
