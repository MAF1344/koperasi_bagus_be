import Transaction from '../models/Transaction.js';
import Product from '../models/Product.js';
import {successResponse, errorResponse} from '../utils/helpers.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private (Admin, SuperAdmin)
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    return successResponse(res, 200, 'Data transaksi berhasil diambil', transactions);
  } catch (error) {
    console.error('Get all transactions error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data transaksi');
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const {id} = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return errorResponse(res, 404, 'Transaksi tidak ditemukan');
    }

    return successResponse(res, 200, 'Data transaksi berhasil diambil', transaction);
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data transaksi');
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private (Admin, SuperAdmin)
export const createTransaction = async (req, res) => {
  try {
    console.log('\n=== CREATE TRANSACTION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {nama_pelanggan, items, total_harga, total_bayar, kembalian} = req.body;

    console.log('1. Validation starting...');

    // Validation
    if (!items || items.length === 0) {
      console.log('❌ Error: Keranjang kosong');
      return errorResponse(res, 400, 'Keranjang belanja kosong');
    }

    if (!total_harga || !total_bayar) {
      console.log('❌ Error: Total harga atau bayar kosong');
      return errorResponse(res, 400, 'Total harga dan total bayar harus diisi');
    }

    if (parseFloat(total_bayar) < parseFloat(total_harga)) {
      console.log('❌ Error: Uang bayar kurang');
      return errorResponse(res, 400, 'Uang bayar kurang');
    }

    console.log('✅ Basic validation passed');
    console.log('2. Validating stock for', items.length, 'items...');

    // Validate stock availability for each item
    for (const item of items) {
      console.log(`  - Checking product ID: ${item.product_id}`);

      const product = await Product.findById(item.product_id);

      if (!product) {
        console.log(`  ❌ Product ${item.product_id} not found`);
        return errorResponse(res, 404, `Produk ${item.nama_produk} tidak ditemukan`);
      }

      console.log(`  ✅ Product found: ${product.nama_produk}, Stock: ${product.stok}, Needed: ${item.jumlah}`);

      if (product.stok < item.jumlah) {
        console.log(`  ❌ Stock insufficient`);
        return errorResponse(res, 400, `Stok ${product.nama_produk} tidak mencukupi. Stok tersedia: ${product.stok}`);
      }

      if (!product.is_active) {
        console.log(`  ❌ Product not active`);
        return errorResponse(res, 400, `Produk ${product.nama_produk} tidak aktif`);
      }
    }

    console.log('✅ All stock validation passed');
    console.log('3. Creating transaction...');

    // Create transaction
    const result = await Transaction.createWithItems(
      {
        kasir_id: req.user.id,
        nama_pelanggan: nama_pelanggan || 'Umum',
        total_harga: parseFloat(total_harga),
        total_bayar: parseFloat(total_bayar),
        kembalian: parseFloat(kembalian) || 0,
      },
      items,
    );

    console.log('✅ Transaction created with ID:', result.id);
    console.log('✅ Transaction code:', result.kode_transaksi);
    console.log('4. Fetching created transaction...');

    // Get created transaction
    const transaction = await Transaction.findById(result.id);

    console.log('✅ Transaction fetched successfully');
    console.log('=== END CREATE TRANSACTION ===\n');

    return successResponse(res, 201, 'Transaksi berhasil dibuat', transaction);
  } catch (error) {
    console.error('\n❌ CREATE TRANSACTION ERROR:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END ERROR ===\n');

    return errorResponse(res, 500, 'Terjadi kesalahan saat membuat transaksi');
  }
};

// @desc    Get transactions by date range
// @route   GET /api/transactions/date-range
// @access  Private
export const getTransactionsByDateRange = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;

    if (!startDate || !endDate) {
      return errorResponse(res, 400, 'Start date dan end date harus diisi');
    }

    const transactions = await Transaction.findByDateRange(startDate, endDate);

    return successResponse(res, 200, 'Data transaksi berhasil diambil', transactions);
  } catch (error) {
    console.error('Get transactions by date range error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data transaksi');
  }
};

// @desc    Get today's transactions
// @route   GET /api/transactions/today
// @access  Private
export const getTodayTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findToday();
    return successResponse(res, 200, 'Data transaksi hari ini berhasil diambil', transactions);
  } catch (error) {
    console.error('Get today transactions error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data transaksi');
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;
    const stats = await Transaction.getStats(startDate, endDate);

    return successResponse(res, 200, 'Statistik transaksi berhasil diambil', stats);
  } catch (error) {
    console.error('Get transaction stats error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil statistik transaksi');
  }
};

// @desc    Get daily sales
// @route   GET /api/transactions/daily-sales
// @access  Private
export const getDailySales = async (req, res) => {
  try {
    const {days} = req.query;
    const sales = await Transaction.getDailySales(days || 7);

    return successResponse(res, 200, 'Data penjualan harian berhasil diambil', sales);
  } catch (error) {
    console.error('Get daily sales error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data penjualan');
  }
};

// @desc    Search transactions
// @route   GET /api/transactions/search?q=query
// @access  Private
export const searchTransactions = async (req, res) => {
  try {
    const {q} = req.query;

    if (!q || q.trim() === '') {
      return errorResponse(res, 400, 'Query pencarian harus diisi');
    }

    const transactions = await Transaction.search(q);

    return successResponse(res, 200, 'Hasil pencarian transaksi', transactions);
  } catch (error) {
    console.error('Search transactions error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mencari transaksi');
  }
};
