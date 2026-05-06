import Product from '../models/Product.js';
import {successResponse, errorResponse} from '../utils/helpers.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Private (Admin, SuperAdmin)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    return successResponse(res, 200, 'Data produk berhasil diambil', products);
  } catch (error) {
    console.error('Get all products error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data produk');
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const {id} = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }

    return successResponse(res, 200, 'Data produk berhasil diambil', product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data produk');
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, SuperAdmin)
export const createProduct = async (req, res) => {
  try {
    const {nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan} = req.body;

    // Validation
    if (!nama_produk || !kategori || !harga_beli || !harga_jual) {
      return errorResponse(res, 400, 'Nama produk, kategori, harga beli, dan harga jual harus diisi');
    }

    // Validate category
    const validCategories = ['buku', 'seragam', 'atk'];
    if (!validCategories.includes(kategori)) {
      return errorResponse(res, 400, 'Kategori tidak valid. Pilih: buku, seragam, atau atk');
    }

    // Validate prices
    if (parseFloat(harga_beli) < 0 || parseFloat(harga_jual) < 0) {
      return errorResponse(res, 400, 'Harga tidak boleh negatif');
    }

    if (parseFloat(harga_jual) < parseFloat(harga_beli)) {
      return errorResponse(res, 400, 'Harga jual tidak boleh lebih kecil dari harga beli');
    }

    // Validate stock
    if (stok && parseInt(stok) < 0) {
      return errorResponse(res, 400, 'Stok tidak boleh negatif');
    }

    // Create product
    const productId = await Product.create({
      nama_produk,
      kategori,
      deskripsi,
      harga_beli: parseFloat(harga_beli),
      harga_jual: parseFloat(harga_jual),
      stok: stok ? parseInt(stok) : 0,
      satuan: satuan || 'pcs',
      created_by: req.user.id,
    });

    // Get created product
    const product = await Product.findById(productId);

    return successResponse(res, 201, 'Produk berhasil ditambahkan', product);
  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menambahkan produk');
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, SuperAdmin)
export const updateProduct = async (req, res) => {
  try {
    const {id} = req.params;
    const {nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan, is_active} = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }

    // Validation
    if (!nama_produk || !kategori || !harga_beli || !harga_jual) {
      return errorResponse(res, 400, 'Nama produk, kategori, harga beli, dan harga jual harus diisi');
    }

    // Validate category
    const validCategories = ['buku', 'seragam', 'atk'];
    if (!validCategories.includes(kategori)) {
      return errorResponse(res, 400, 'Kategori tidak valid');
    }

    // Validate prices
    if (parseFloat(harga_beli) < 0 || parseFloat(harga_jual) < 0) {
      return errorResponse(res, 400, 'Harga tidak boleh negatif');
    }

    if (parseFloat(harga_jual) < parseFloat(harga_beli)) {
      return errorResponse(res, 400, 'Harga jual tidak boleh lebih kecil dari harga beli');
    }

    // Validate stock
    if (stok !== undefined && parseInt(stok) < 0) {
      return errorResponse(res, 400, 'Stok tidak boleh negatif');
    }

    // Update product
    await Product.update(id, {
      nama_produk,
      kategori,
      deskripsi,
      harga_beli: parseFloat(harga_beli),
      harga_jual: parseFloat(harga_jual),
      stok: stok !== undefined ? parseInt(stok) : existingProduct.stok,
      satuan: satuan || 'pcs',
      is_active: is_active !== undefined ? is_active : existingProduct.is_active,
    });

    // Get updated product
    const updatedProduct = await Product.findById(id);

    return successResponse(res, 200, 'Produk berhasil diperbarui', updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat memperbarui produk');
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin, SuperAdmin)
export const deleteProduct = async (req, res) => {
  try {
    const {id} = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }

    // Delete product
    await Product.delete(id);

    return successResponse(res, 200, 'Produk berhasil dihapus');
  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menghapus produk');
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Private
export const getProductsByCategory = async (req, res) => {
  try {
    const {category} = req.params;

    // Validate category
    const validCategories = ['buku', 'seragam', 'atk'];
    if (!validCategories.includes(category)) {
      return errorResponse(res, 400, 'Kategori tidak valid');
    }

    const products = await Product.findByCategory(category);

    return successResponse(res, 200, `Data produk kategori ${category} berhasil diambil`, products);
  } catch (error) {
    console.error('Get products by category error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data produk');
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private
export const getProductStats = async (req, res) => {
  try {
    const stats = await Product.getStats();

    return successResponse(res, 200, 'Statistik produk berhasil diambil', stats);
  } catch (error) {
    console.error('Get product stats error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil statistik produk');
  }
};

// @desc    Search products
// @route   GET /api/products/search?q=query
// @access  Private
export const searchProducts = async (req, res) => {
  try {
    const {q} = req.query;

    if (!q || q.trim() === '') {
      return errorResponse(res, 400, 'Query pencarian harus diisi');
    }

    const products = await Product.search(q);

    return successResponse(res, 200, 'Hasil pencarian produk', products);
  } catch (error) {
    console.error('Search products error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mencari produk');
  }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private (Admin, SuperAdmin)
export const updateStock = async (req, res) => {
  try {
    const {id} = req.params;
    const {quantity, operation} = req.body;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 404, 'Produk tidak ditemukan');
    }

    // Validation
    if (!quantity || parseInt(quantity) <= 0) {
      return errorResponse(res, 400, 'Jumlah harus lebih dari 0');
    }

    if (operation && !['add', 'subtract'].includes(operation)) {
      return errorResponse(res, 400, 'Operasi tidak valid. Gunakan: add atau subtract');
    }

    // Check if subtract operation would result in negative stock
    if (operation === 'subtract' && product.stok < parseInt(quantity)) {
      return errorResponse(res, 400, 'Stok tidak mencukupi');
    }

    // Update stock
    await Product.updateStock(id, parseInt(quantity), operation || 'add');

    // Get updated product
    const updatedProduct = await Product.findById(id);

    return successResponse(res, 200, 'Stok produk berhasil diperbarui', updatedProduct);
  } catch (error) {
    console.error('Update stock error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat memperbarui stok');
  }
};
