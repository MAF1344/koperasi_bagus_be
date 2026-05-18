import {pool} from '../config/database.js';

class Product {
  // Get all products
  static async findAll() {
    const {rows} = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return rows;
  }

  // Get product by ID
  static async findById(id) {
    const {rows} = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return rows[0];
  }

  // Get products by category
  static async findByCategory(category) {
    const {rows} = await pool.query('SELECT * FROM products WHERE kategori = $1 ORDER BY created_at DESC', [category]);
    return rows;
  }

  // Create new product
  static async create(productData) {
    const {nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan, created_by} = productData;
    const {rows} = await pool.query(
      'INSERT INTO products (nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [
        nama_produk,
        kategori,
        deskripsi || null,
        harga_beli,
        harga_jual,
        stok || 0,
        satuan || 'pcs',
        created_by,
      ]
    );
    return rows[0].id;
  }

  // Update product
  static async update(id, productData) {
    const {nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan, is_active} = productData;

    const result = await pool.query(
      'UPDATE products SET nama_produk = $1, kategori = $2, deskripsi = $3, harga_beli = $4, harga_jual = $5, stok = $6, satuan = $7, is_active = $8 WHERE id = $9',
      [
        nama_produk,
        kategori,
        deskripsi,
        harga_beli,
        harga_jual,
        stok,
        satuan,
        is_active !== undefined ? is_active : true,
        id,
      ]
    );
    return result.rowCount;
  }

  // Delete product
  static async delete(id) {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount;
  }

  // Update stock
  static async updateStock(id, quantity, operation = 'add') {
    const query = operation === 'add' ? 'UPDATE products SET stok = stok + $1 WHERE id = $2' : 'UPDATE products SET stok = stok - $1 WHERE id = $2';

    const result = await pool.query(query, [quantity, id]);
    return result.rowCount;
  }

  // Get total products count
  static async count() {
    const {rows} = await pool.query('SELECT COUNT(*) as total FROM products');
    return parseInt(rows[0].total);
  }

  // Get count by category
  static async countByCategory(category) {
    const {rows} = await pool.query('SELECT COUNT(*) as total FROM products WHERE kategori = $1', [category]);
    return parseInt(rows[0].total);
  }

  // Get products with low stock (less than threshold)
  static async findLowStock(threshold = 10) {
    const {rows} = await pool.query('SELECT * FROM products WHERE stok < $1 ORDER BY stok ASC', [threshold]);
    return rows;
  }

  // Get product statistics
  static async getStats() {
    const {rows} = await pool.query(`
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
    const {rows} = await pool.query('SELECT * FROM products WHERE nama_produk LIKE $1 OR deskripsi LIKE $2 ORDER BY created_at DESC', [`%${searchTerm}%`, `%${searchTerm}%`]);
    return rows;
  }
}

export default Product;
