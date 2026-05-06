import {pool} from '../config/database.js';
import Pinjaman from './Pinjaman.js';

class Angsuran {
  /**
   * ================================
   *  CREATE SATU RECORD ANGSURAN
   * ================================
   */
  static async create(data) {
    const {pinjaman_id, angsuran_ke, jumlah_angsuran, tanggal_jatuh_tempo, status, denda = 0, keterangan = null} = data;

    const [result] = await pool.query(
      `
      INSERT INTO angsuran_pinjaman 
        (pinjaman_id, angsuran_ke, jumlah_angsuran, tanggal_jatuh_tempo, status, denda, keterangan)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [pinjaman_id, angsuran_ke, jumlah_angsuran, tanggal_jatuh_tempo, status, denda, keterangan],
    );

    return result.insertId;
  }

  /**
   * ================================
   *  GENERATE PAYMENT SCHEDULE
   * ================================
   */
  static async generateSchedule(pinjamanId) {
    try {
      console.log(`[Angsuran] Generating schedule for pinjaman ID: ${pinjamanId}`);

      // 1. Ambil data pinjaman
      const pinjaman = await Pinjaman.findById(pinjamanId);
      if (!pinjaman) {
        throw new Error(`Pinjaman dengan ID ${pinjamanId} tidak ditemukan`);
      }

      // 2. Validasi status pinjaman
      if (pinjaman.status !== 'approved' && pinjaman.status !== 'lunas') {
        throw new Error(`Pinjaman dengan status "${pinjaman.status}" tidak dapat dibuatkan jadwal angsuran`);
      }

      // 3. Validasi data yang diperlukan
      if (!pinjaman.tenor_bulan || pinjaman.tenor_bulan <= 0) {
        throw new Error(`Tenor bulan tidak valid: ${pinjaman.tenor_bulan}`);
      }

      if (!pinjaman.angsuran_perbulan || pinjaman.angsuran_perbulan <= 0) {
        throw new Error(`Jumlah angsuran per bulan tidak valid: ${pinjaman.angsuran_perbulan}`);
      }

      // 4. Cek apakah sudah ada jadwal angsuran (double check)
      const existingSchedules = await this.findByPinjaman(pinjamanId);
      if (existingSchedules && existingSchedules.length > 0) {
        console.log(`[Angsuran] Schedule already exists for pinjaman ID: ${pinjamanId}`);
        throw new Error(`Jadwal angsuran sudah ada untuk pinjaman ${pinjaman.kode_pinjaman}`);
      }

      // 5. Tentukan tanggal mulai (gunakan tanggal approval, fallback ke tanggal pinjaman)
      let startDate;
      if (pinjaman.approved_at) {
        startDate = new Date(pinjaman.approved_at);
      } else if (pinjaman.tanggal_pinjaman) {
        startDate = new Date(pinjaman.tanggal_pinjaman);
      } else {
        throw new Error('Tanggal pinjaman atau tanggal approval tidak ditemukan');
      }

      // Validasi tanggal
      if (isNaN(startDate.getTime())) {
        throw new Error(`Tanggal tidak valid: ${pinjaman.approved_at || pinjaman.tanggal_pinjaman}`);
      }

      console.log(`[Angsuran] Start date for schedule: ${startDate.toISOString()}`);

      // 6. Generate jadwal angsuran
      const schedules = [];
      const tenorBulan = pinjaman.tenor_bulan;
      const angsuranPerBulan = parseFloat(pinjaman.angsuran_perbulan);

      for (let angsuranKe = 1; angsuranKe <= tenorBulan; angsuranKe++) {
        // Hitung tanggal jatuh tempo (tanggal mulai + angsuranKe bulan)
        const jatuhTempo = new Date(startDate);
        jatuhTempo.setMonth(jatuhTempo.getMonth() + angsuranKe);

        // Format tanggal ke YYYY-MM-DD (MySQL date format)
        const tahun = jatuhTempo.getFullYear();
        const bulan = String(jatuhTempo.getMonth() + 1).padStart(2, '0');
        const tanggal = String(jatuhTempo.getDate()).padStart(2, '0');
        const formattedJatuhTempo = `${tahun}-${bulan}-${tanggal}`;

        schedules.push([
          pinjamanId, // pinjaman_id
          angsuranKe, // angsuran_ke
          angsuranPerBulan, // jumlah_angsuran
          formattedJatuhTempo, // tanggal_jatuh_tempo
          'belum_bayar', // status
          0, // denda (default 0)
          null, // keterangan
        ]);
      }

      console.log(`[Angsuran] Creating ${schedules.length} schedules for pinjaman ID: ${pinjamanId}`);

      // 7. Insert ke database dalam satu query batch
      if (schedules.length > 0) {
        const [result] = await pool.query(
          `
        INSERT INTO angsuran_pinjaman 
          (pinjaman_id, angsuran_ke, jumlah_angsuran, tanggal_jatuh_tempo, status, denda, keterangan)
        VALUES ?
        `,
          [schedules],
        );

        console.log(`[Angsuran] Successfully created ${result.affectedRows} schedules`);

        // 8. Return informasi lengkap
        return {
          success: true,
          pinjaman_id: pinjamanId,
          kode_pinjaman: pinjaman.kode_pinjaman,
          total_angsuran: schedules.length,
          angsuran_per_bulan: angsuranPerBulan,
          tanggal_mulai: startDate.toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        };
      }

      throw new Error('Tidak ada jadwal angsuran yang dibuat');
    } catch (error) {
      console.error(`[Angsuran] Error generating schedule: ${error.message}`);
      throw error;
    }
  }

  /**
   * ================================
   *  GET ANGSURAN BY PINJAMAN
   * ================================
   */
  static async findByPinjaman(pinjamanId) {
    const [rows] = await pool.query(
      `
    SELECT 
      a.*,
      p.kode_pinjaman,
      p.tenor_bulan as total_angsuran
    FROM angsuran_pinjaman a
    JOIN pinjaman p ON a.pinjaman_id = p.id
    WHERE a.pinjaman_id = ?
    ORDER BY a.angsuran_ke ASC
    `,
      [pinjamanId],
    );

    return rows.map((row) => ({
      ...row,
      jumlah_angsuran: parseFloat(row.jumlah_angsuran),
      denda: parseFloat(row.denda || 0),
    }));
  }

  /**
   * ================================
   *  GET ANGSURAN BY ID
   * ================================
   */
  static async findById(id) {
    const [rows] = await pool.query(
      `
    SELECT 
      a.*,
      p.kode_pinjaman,
      p.user_id,
      p.total_pinjaman,
      p.tenor_bulan, 
      u.nama_lengkap AS peminjam
    FROM angsuran_pinjaman a
    JOIN pinjaman p ON a.pinjaman_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE a.id = ?
    `,
      [id],
    );

    if (rows.length === 0) return null;

    // Format data untuk memudahkan penggunaan
    const angsuran = rows[0];
    return {
      ...angsuran,
      jumlah_angsuran: parseFloat(angsuran.jumlah_angsuran),
      denda: parseFloat(angsuran.denda || 0),
      total_pinjaman: parseFloat(angsuran.total_pinjaman),
      total_angsuran: angsuran.tenor_bulan,
    };
  }

  /**
   * ================================
   *  SUMMARY UNTUK PINJAMAN
   * ================================
   */
  static async getSummaryByPinjaman(pinjamanId) {
    const [rows] = await pool.query(
      `
    SELECT 
      COUNT(*) AS total_angsuran,
      SUM(CASE WHEN status = 'sudah_bayar' THEN 1 ELSE 0 END) AS jumlah_lunas,
      SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) AS jumlah_terlambat,
      SUM(CASE WHEN status IN ('sudah_bayar', 'terlambat') THEN jumlah_angsuran ELSE 0 END) AS total_terbayar,
      SUM(CASE WHEN status = 'belum_bayar' THEN jumlah_angsuran ELSE 0 END) AS sisa_pembayaran,
      SUM(denda) AS total_denda
    FROM angsuran_pinjaman
    WHERE pinjaman_id = ?
    `,
      [pinjamanId],
    );

    const summary = rows[0];

    summary.total_angsuran = Number(summary.total_angsuran) || 0;
    summary.jumlah_lunas = Number(summary.jumlah_lunas) || 0;
    summary.jumlah_terlambat = Number(summary.jumlah_terlambat) || 0;
    summary.total_terbayar = Number(summary.total_terbayar) || 0;
    summary.sisa_pembayaran = Number(summary.sisa_pembayaran) || 0;
    summary.total_denda = Number(summary.total_denda) || 0;

    // sisa angsuran = total - lunas - terlambat
    summary.sisa_angsuran = summary.total_angsuran - summary.jumlah_lunas - summary.jumlah_terlambat;

    return summary;
  }

  /**
   * ================================
   *  RECORD PEMBAYARAN
   * ================================
   */
  static async recordPayment(angsuranId, paymentData) {
    const {tanggal_bayar, status, keterangan, created_by} = paymentData;

    // Update angsuran dengan data pembayaran
    const [result] = await pool.query(
      `
    UPDATE angsuran_pinjaman
    SET tanggal_angsuran = ?,
        status = ?,
        keterangan = ?,
        created_by = ?
    WHERE id = ? AND status = 'belum_bayar'
    `,
      [tanggal_bayar, status, keterangan, created_by, angsuranId],
    );

    return result.affectedRows > 0;
  }

  /**
   * ================================
   *  CEK & UPDATE STATUS PINJAMAN
   * ================================
   */
  static async checkAndUpdatePinjamanStatus(pinjamanId) {
    const [[result]] = await pool.query(
      `
    SELECT 
      COUNT(*) AS total,
      SUM(CASE WHEN status IN ('sudah_bayar', 'terlambat') THEN 1 ELSE 0 END) AS sudah_dibayar
    FROM angsuran_pinjaman
    WHERE pinjaman_id = ?
    `,
      [pinjamanId],
    );

    if (result.total === result.sudah_dibayar) {
      await Pinjaman.markAsLunas(pinjamanId);
      return true;
    }
    return false;
  }

  /**
   * ================================
   *  GET ANGSURAN TERLAMBAT
   * ================================
   */
  static async getOverdue() {
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `
      SELECT 
        a.*,
        p.kode_pinjaman,
        p.user_id,
        u.nama_lengkap AS nama_peminjam
      FROM angsuran_pinjaman a
      JOIN pinjaman p ON a.pinjaman_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.status = 'belum_bayar'
        AND a.tanggal_jatuh_tempo < ?
      ORDER BY a.tanggal_jatuh_tempo ASC
      `,
      [today],
    );

    return rows;
  }

  /**
   * ================================
   *  GET ANGSURAN TERLAMBAT BY USER
   * ================================
   */
  static async findOverdueByUser(userId) {
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await pool.query(
      `
      SELECT 
        a.*,
        p.kode_pinjaman,
        p.user_id,
        u.nama_lengkap AS nama_peminjam
      FROM angsuran_pinjaman a
      JOIN pinjaman p ON a.pinjaman_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
        AND a.status = 'belum_bayar'
        AND a.tanggal_jatuh_tempo < ?
      ORDER BY a.tanggal_jatuh_tempo ASC
      `,
      [userId, today],
    );

    return rows;
  }

  /**
   * ================================
   *  GET PEMBAYARAN MENDATANG
   * ================================
   */
  static async findUpcoming(days = 7) {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const [rows] = await pool.query(
      `
      SELECT 
        a.*,
        p.kode_pinjaman,
        p.user_id,
        u.nama_lengkap AS nama_peminjam
      FROM angsuran_pinjaman a
      JOIN pinjaman p ON a.pinjaman_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.status = 'belum_bayar'
        AND a.tanggal_jatuh_tempo BETWEEN ? AND ?
      ORDER BY a.tanggal_jatuh_tempo ASC
      `,
      [today, futureDateStr],
    );

    return rows;
  }

  /**
   * ================================
   *  GET PEMBAYARAN MENDATANG BY USER
   * ================================
   */
  static async findUpcomingByUser(userId, days = 7) {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const [rows] = await pool.query(
      `
      SELECT 
        a.*,
        p.kode_pinjaman,
        p.user_id,
        u.nama_lengkap AS nama_peminjam
      FROM angsuran_pinjaman a
      JOIN pinjaman p ON a.pinjaman_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
        AND a.status = 'belum_bayar'
        AND a.tanggal_jatuh_tempo BETWEEN ? AND ?
      ORDER BY a.tanggal_jatuh_tempo ASC
      `,
      [userId, today, futureDateStr],
    );

    return rows;
  }

  /**
   * ================================
   *  GET GLOBAL STATISTICS
   * ================================
   */
  static async getStats() {
    const [[stats]] = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_angsuran,
        SUM(CASE WHEN status = 'sudah_bayar' THEN 1 ELSE 0 END) AS lunas,
        SUM(CASE WHEN status = 'belum_bayar' THEN 1 ELSE 0 END) AS belum_bayar,
        SUM(CASE WHEN status = 'terlambat' THEN 1 ELSE 0 END) AS terlambat,
        SUM(CASE WHEN status = 'sudah_bayar' THEN jumlah_angsuran ELSE 0 END) AS total_terbayar,
        SUM(CASE WHEN status IN ('belum_bayar', 'terlambat') THEN jumlah_angsuran ELSE 0 END) AS total_outstanding,
        SUM(denda) AS total_denda
      FROM angsuran_pinjaman
      `,
    );

    return stats;
  }

  /**
   * ================================
   *  GET STATISTICS BY USER
   * ================================
   */
  static async getStatsByUser(userId) {
    const [[stats]] = await pool.query(
      `
      SELECT 
        COUNT(*) AS total_angsuran,
        SUM(CASE WHEN a.status = 'sudah_bayar' THEN 1 ELSE 0 END) AS lunas,
        SUM(CASE WHEN a.status = 'belum_bayar' THEN 1 ELSE 0 END) AS belum_bayar,
        SUM(CASE WHEN a.status = 'terlambat' THEN 1 ELSE 0 END) AS terlambat,
        SUM(CASE WHEN a.status = 'sudah_bayar' THEN a.jumlah_angsuran ELSE 0 END) AS total_terbayar,
        SUM(CASE WHEN a.status IN ('belum_bayar', 'terlambat') THEN a.jumlah_angsuran ELSE 0 END) AS total_outstanding,
        SUM(a.denda) AS total_denda
      FROM angsuran_pinjaman a
      JOIN pinjaman p ON a.pinjaman_id = p.id
      WHERE p.user_id = ?
      `,
      [userId],
    );

    return stats;
  }

  /**
   * ================================
   *  UPDATE KETERANGAN
   * ================================
   */
  static async updateKeterangan(id, keterangan) {
    const [result] = await pool.query(
      `
      UPDATE angsuran_pinjaman
      SET keterangan = ?
      WHERE id = ?
      `,
      [keterangan, id],
    );

    return result.affectedRows;
  }

  /**
   * ================================
   *  UPDATE SISA PINJAMAN
   * ================================
   */
  static async updatePinjamanSisa(pinjamanId) {
    // Hitung total yang sudah dibayar
    const [[result]] = await pool.query(
      `
    SELECT 
      COALESCE(SUM(jumlah_angsuran), 0) AS total_terbayar
    FROM angsuran_pinjaman
    WHERE pinjaman_id = ? 
      AND status IN ('sudah_bayar', 'terlambat')
    `,
      [pinjamanId],
    );

    // Update sisa pinjaman
    await pool.query(
      `
    UPDATE pinjaman
    SET sisa_pinjaman = total_pinjaman - ?
    WHERE id = ?
    `,
      [result.total_terbayar, pinjamanId],
    );

    // Cek apakah sudah lunas
    const [[pinjaman]] = await pool.query(`SELECT total_pinjaman, sisa_pinjaman, status FROM pinjaman WHERE id = ?`, [pinjamanId]);

    // ⚠️ Hanya update status jika belum lunas
    if (pinjaman.sisa_pinjaman <= 0 && pinjaman.status !== 'lunas') {
      await pool.query(`UPDATE pinjaman SET status = 'lunas' WHERE id = ?`, [pinjamanId]);
      return true; // Sudah lunas
    }
    return false; // Belum lunas
  }

  /**
   * ================================
   *  GET TOTAL ANGSURAN UNTUK PINJAMAN
   * ================================
   */
  static async getTotalAngsuran(pinjamanId) {
    const [[result]] = await pool.query(
      `
    SELECT COUNT(*) as total
    FROM angsuran_pinjaman
    WHERE pinjaman_id = ?
    `,
      [pinjamanId],
    );

    return result.total;
  }
}

export default Angsuran;
