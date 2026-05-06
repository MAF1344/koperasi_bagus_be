import {pool} from '../config/database.js';

class Report {
  // Get sales statistics for a date range
  static async getSalesStats(startDate, endDate) {
    const [rows] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_harga), 0) as total_revenue,
        COALESCE(AVG(total_harga), 0) as average_sale,
        COALESCE(SUM(td.jumlah), 0) as total_items_sold
      FROM transactions t
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
      WHERE DATE(t.tanggal_transaksi) BETWEEN ? AND ?
    `,
      [startDate, endDate],
    );

    return rows[0];
  }

  // Get profit calculation (revenue - cost)
  static async getProfitStats(startDate, endDate) {
    const [rows] = await pool.query(
      `
      SELECT 
        COALESCE(SUM(td.subtotal), 0) as total_revenue,
        COALESCE(SUM(p.harga_beli * td.jumlah), 0) as total_cost,
        COALESCE(SUM(td.subtotal - (p.harga_beli * td.jumlah)), 0) as total_profit
      FROM transaction_details td
      JOIN transactions t ON td.transaction_id = t.id
      JOIN products p ON td.product_id = p.id
      WHERE DATE(t.tanggal_transaksi) BETWEEN ? AND ?
    `,
      [startDate, endDate],
    );

    return rows[0];
  }

  // Get daily sales trend
  static async getDailySalesTrend(days = 7) {
    const [rows] = await pool.query(
      `
      SELECT 
        DATE(tanggal_transaksi) as date,
        COUNT(*) as transaction_count,
        COALESCE(SUM(total_harga), 0) as total_sales
      FROM transactions
      WHERE tanggal_transaksi >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(tanggal_transaksi)
      ORDER BY date ASC
    `,
      [days],
    );

    return rows;
  }

  // Get monthly sales trend (last 12 months)
  static async getMonthlySalesTrend() {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(tanggal_transaksi, '%Y-%m') as month,
        COUNT(*) as transaction_count,
        COALESCE(SUM(total_harga), 0) as total_sales
      FROM transactions
      WHERE tanggal_transaksi >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(tanggal_transaksi, '%Y-%m')
      ORDER BY month ASC
    `);

    return rows;
  }

  // Get top selling products
  static async getTopProducts(limit = 5, startDate = null, endDate = null) {
    let query = `
      SELECT 
        p.id,
        p.nama_produk,
        p.kategori,
        p.harga_jual,
        p.harga_beli,
        COALESCE(SUM(td.jumlah), 0) as total_sold,
        COALESCE(SUM(td.subtotal), 0) as total_revenue,
        COALESCE(SUM(td.subtotal - (p.harga_beli * td.jumlah)), 0) as total_profit
      FROM products p
      LEFT JOIN transaction_details td ON p.id = td.product_id
      LEFT JOIN transactions t ON td.transaction_id = t.id
    `;

    const params = [];

    if (startDate && endDate) {
      query += ' WHERE DATE(t.tanggal_transaksi) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += `
      GROUP BY p.id, p.nama_produk, p.kategori, p.harga_jual, p.harga_beli
      ORDER BY total_sold DESC
      LIMIT ?
    `;
    params.push(limit);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get sales by category
  static async getSalesByCategory(startDate = null, endDate = null) {
    let query = `
      SELECT 
        p.kategori,
        COUNT(DISTINCT td.id) as transaction_count,
        COALESCE(SUM(td.jumlah), 0) as total_quantity,
        COALESCE(SUM(td.subtotal), 0) as total_revenue,
        COALESCE(SUM(td.subtotal - (p.harga_beli * td.jumlah)), 0) as total_profit
      FROM products p
      LEFT JOIN transaction_details td ON p.id = td.product_id
      LEFT JOIN transactions t ON td.transaction_id = t.id
    `;

    const params = [];

    if (startDate && endDate) {
      query += ' WHERE DATE(t.tanggal_transaksi) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' GROUP BY p.kategori ORDER BY total_revenue DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Get low stock products
  static async getLowStockProducts(threshold = 10) {
    const [rows] = await pool.query(
      `
      SELECT 
        id,
        nama_produk,
        kategori,
        stok,
        satuan,
        harga_beli,
        harga_jual
      FROM products
      WHERE stok < ? AND is_active = 1
      ORDER BY stok ASC
      LIMIT 10
    `,
      [threshold],
    );

    return rows;
  }

  // Get overall statistics
  static async getOverallStats() {
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE is_active = 1) as total_products,
        (SELECT COUNT(*) FROM transactions) as total_transactions,
        (SELECT COALESCE(SUM(total_harga), 0) FROM transactions) as all_time_revenue,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_active_users
    `);

    return stats[0];
  }

  // Get product performance (best & worst)
  static async getProductPerformance(startDate = null, endDate = null) {
    let query = `
      SELECT 
        p.id,
        p.nama_produk,
        p.kategori,
        p.stok,
        COALESCE(SUM(td.jumlah), 0) as total_sold,
        COALESCE(SUM(td.subtotal), 0) as total_revenue,
        COALESCE(SUM(td.subtotal - (p.harga_beli * td.jumlah)), 0) as total_profit,
        ROUND(
          COALESCE(
            (SUM(td.subtotal - (p.harga_beli * td.jumlah)) / NULLIF(SUM(p.harga_beli * td.jumlah), 0)) * 100,
            0
          ),
          2
        ) as profit_margin_percent
      FROM products p
      LEFT JOIN transaction_details td ON p.id = td.product_id
      LEFT JOIN transactions t ON td.transaction_id = t.id
    `;

    const params = [];

    if (startDate && endDate) {
      query += ' WHERE DATE(t.tanggal_transaksi) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' GROUP BY p.id, p.nama_produk, p.kategori, p.stok';

    const [rows] = await pool.query(query, params);

    // Separate into best and worst performers
    const sorted = rows.sort((a, b) => b.total_revenue - a.total_revenue);

    return {
      best_performers: sorted.slice(0, 5),
      worst_performers: sorted.slice(-5).reverse(),
    };
  }
}

export default Report;
