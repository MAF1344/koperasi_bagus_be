import {pool} from '../config/database.js';

class Transaction {
  // Generate transaction code (TRX-001, TRX-002, etc)
  static async generateTransactionCode() {
    const {rows} = await pool.query('SELECT kode_transaksi FROM transactions ORDER BY id DESC LIMIT 1');

    if (rows.length === 0) {
      return 'TRX-001';
    }

    const lastCode = rows[0].kode_transaksi;
    const lastNumber = parseInt(lastCode.split('-')[1]);
    const newNumber = lastNumber + 1;
    return `TRX-${String(newNumber).padStart(3, '0')}`;
  }

  // Get all transactions with details
  static async findAll() {
    const {rows} = await pool.query(`
      SELECT 
        t.*,
        u.nama_lengkap as nama_kasir,
        COUNT(td.id) as total_items,
        SUM(td.jumlah) as total_quantity
      FROM transactions t
      LEFT JOIN users u ON t.kasir_id = u.id
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
      GROUP BY t.id, u.nama_lengkap
      ORDER BY t.tanggal_transaksi DESC
    `);
    return rows;
  }

  // Get transaction by ID with items
  static async findById(id) {
    const {rows: transactions} = await pool.query(
      `
      SELECT 
        t.*,
        u.nama_lengkap as nama_kasir,
        u.username as username_kasir
      FROM transactions t
      LEFT JOIN users u ON t.kasir_id = u.id
      WHERE t.id = $1
    `,
      [id],
    );

    if (transactions.length === 0) return null;

    const transaction = transactions[0];

    // Get transaction items
    const {rows: items} = await pool.query(
      `
      SELECT 
        td.*,
        p.nama_produk,
        p.kategori,
        p.satuan
      FROM transaction_details td
      LEFT JOIN products p ON td.product_id = p.id
      WHERE td.transaction_id = $1
      ORDER BY td.id
    `,
      [id],
    );

    transaction.items = items;
    return transaction;
  }

  // Create transaction with items (atomic operation)
  static async createWithItems(transactionData, items) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Generate transaction code
      const kode_transaksi = await this.generateTransactionCode();

      // Insert transaction
      const {rows} = await client.query(
        `INSERT INTO transactions 
         (kode_transaksi, tanggal_transaksi, total_harga, total_bayar, kembalian, kasir_id, nama_pelanggan, metode_pembayaran) 
         VALUES ($1, NOW(), $2, $3, $4, $5, $6, 'tunai') RETURNING id`,
        [kode_transaksi, transactionData.total_harga, transactionData.total_bayar, transactionData.kembalian, transactionData.kasir_id, transactionData.nama_pelanggan || 'Umum'],
      );

      const transactionId = rows[0].id;

      // Insert each item and update stock
      for (const item of items) {
        // Insert transaction detail
        await client.query(
          `INSERT INTO transaction_details 
           (transaction_id, product_id, nama_produk, harga_satuan, jumlah, subtotal) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [transactionId, item.product_id, item.nama_produk, item.harga_satuan, item.jumlah, item.subtotal],
        );

        // Update product stock
        await client.query('UPDATE products SET stok = stok - $1 WHERE id = $2', [item.jumlah, item.product_id]);
      }

      await client.query('COMMIT');

      // Return transaction with code
      return {
        id: transactionId,
        kode_transaksi: kode_transaksi,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get transactions by date range
  static async findByDateRange(startDate, endDate) {
    const {rows} = await pool.query(
      `
      SELECT 
        t.*,
        u.nama_lengkap as nama_kasir,
        COUNT(td.id) as total_items,
        SUM(td.jumlah) as total_quantity
      FROM transactions t
      LEFT JOIN users u ON t.kasir_id = u.id
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
      WHERE t.tanggal_transaksi::date BETWEEN $1 AND $2
      GROUP BY t.id, u.nama_lengkap
      ORDER BY t.tanggal_transaksi DESC
    `,
      [startDate, endDate],
    );
    return rows;
  }

  // Get today's transactions
  static async findToday() {
    const {rows} = await pool.query(`
      SELECT 
        t.*,
        u.nama_lengkap as nama_kasir,
        COUNT(td.id) as total_items
      FROM transactions t
      LEFT JOIN users u ON t.kasir_id = u.id
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
      WHERE t.tanggal_transaksi::date = CURRENT_DATE
      GROUP BY t.id, u.nama_lengkap
      ORDER BY t.tanggal_transaksi DESC
    `);
    return rows;
  }

  // Get transaction statistics
  static async getStats(startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(DISTINCT t.id) as total_transactions,
        COALESCE(SUM(t.total_harga), 0) as total_sales,
        COALESCE(AVG(t.total_harga), 0) as average_sale,
        COALESCE(SUM(td.jumlah), 0) as total_items_sold
      FROM transactions t
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
    `;

    const params = [];

    if (startDate && endDate) {
      query += ' WHERE t.tanggal_transaksi::date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    const {rows} = await pool.query(query, params);
    return rows[0];
  }

  // Get daily sales summary
  static async getDailySales(days = 7) {
    const {rows} = await pool.query(
      `
      SELECT 
        tanggal_transaksi::date as date,
        COUNT(*) as transaction_count,
        SUM(total_harga) as total_sales
      FROM transactions
      WHERE tanggal_transaksi >= CURRENT_DATE - (INTERVAL '1 day' * $1)
      GROUP BY tanggal_transaksi::date
      ORDER BY date DESC
    `,
      [days],
    );
    return rows;
  }

  // Search transactions
  static async search(searchTerm) {
    const {rows} = await pool.query(
      `
      SELECT 
        t.*,
        u.nama_lengkap as nama_kasir,
        COUNT(td.id) as total_items
      FROM transactions t
      LEFT JOIN users u ON t.kasir_id = u.id
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
      WHERE t.kode_transaksi LIKE $1 
         OR t.nama_pelanggan LIKE $2
         OR u.nama_lengkap LIKE $3
      GROUP BY t.id, u.nama_lengkap
      ORDER BY t.tanggal_transaksi DESC
    `,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
    );
    return rows;
  }
}

export default Transaction;
