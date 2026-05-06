import {pool} from '../config/database.js';

class Product {
  // Get all products
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return rows;
  }

  // Get product by ID
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  // Get products by category
  static async findByCategory(category) {
    const [rows] = await pool.query('SELECT * FROM products WHERE kategori = ? ORDER BY created_at DESC', [category]);
    return rows;
  }

  // Create new product
  static async create(productData) {
    const {nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan, created_by} = productData;
    const [result] = await pool.query('INSERT INTO products (nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      nama_produk,
      kategori,
      deskripsi || null,
      harga_beli,
      harga_jual,
      stok || 0,
      satuan || 'pcs',
      created_by,
    ]);
    return result.insertId;
  }

  // Update product
  static async update(id, productData) {
    const {nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan, is_active} = productData;

    const [result] = await pool.query('UPDATE products SET nama_produk = ?, kategori = ?, deskripsi = ?, harga_beli = ?, harga_jual = ?, stok = ?, satuan = ?, is_active = ? WHERE id = ?', [
      nama_produk,
      kategori,
      deskripsi,
      harga_beli,
      harga_jual,
      stok,
      satuan,
      is_active !== undefined ? is_active : 1,
      id,
    ]);
    return result.affectedRows;
  }

  // Delete product
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows;
  }

  // Update stock
  static async updateStock(id, quantity, operation = 'add') {
    const query = operation === 'add' ? 'UPDATE products SET stok = stok + ? WHERE id = ?' : 'UPDATE products SET stok = stok - ? WHERE id = ?';

    const [result] = await pool.query(query, [quantity, id]);
    return result.affectedRows;
  }

  // Get total products count
  static async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM products');
    return rows[0].total;
  }

  // Get count by category
  static async countByCategory(category) {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM products WHERE kategori = ?', [category]);
    return rows[0].total;
  }

  // Get products with low stock (less than threshold)
  static async findLowStock(threshold = 10) {
    const [rows] = await pool.query('SELECT * FROM products WHERE stok < ? ORDER BY stok ASC', [threshold]);
    return rows;
  }

  // Get product statistics
  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN kategori = 'buku' THEN 1 ELSE 0 END) as total_buku,
        SUM(CASE WHEN kategori = 'seragam' THEN 1 ELSE 0 END) as total_seragam,
        SUM(CASE WHEN kategori = 'atk' THEN 1 ELSE 0 END) as total_atk,
        SUM(stok) as total_stok,
        SUM(stok * harga_beli) as total_modal,
        SUM(stok * harga_jual) as total_nilai_jual
      FROM products
    `);
    return rows[0];
  }

  // Search products
  static async search(searchTerm) {
    const [rows] = await pool.query('SELECT * FROM products WHERE nama_produk LIKE ? OR deskripsi LIKE ? ORDER BY created_at DESC', [`%${searchTerm}%`, `%${searchTerm}%`]);
    return rows;
  }
}

export default Product;
