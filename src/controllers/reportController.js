import Report from '../models/Report.js';
import {successResponse, errorResponse} from '../utils/helpers.js';

// @desc    Get sales statistics
// @route   GET /api/reports/sales-stats?startDate=&endDate=
// @access  Private
export const getSalesStats = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;

    if (!startDate || !endDate) {
      return errorResponse(res, 400, 'Start date dan end date harus diisi');
    }

    const stats = await Report.getSalesStats(startDate, endDate);
    const profitStats = await Report.getProfitStats(startDate, endDate);

    const combinedStats = {
      ...stats,
      ...profitStats,
      profit_margin: profitStats.total_revenue > 0 ? ((profitStats.total_profit / profitStats.total_revenue) * 100).toFixed(2) : 0,
    };

    return successResponse(res, 200, 'Statistik penjualan berhasil diambil', combinedStats);
  } catch (error) {
    console.error('Get sales stats error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil statistik');
  }
};

// @desc    Get daily sales trend
// @route   GET /api/reports/daily-trend?days=7
// @access  Private
export const getDailySalesTrend = async (req, res) => {
  try {
    const {days = 7} = req.query;
    const trend = await Report.getDailySalesTrend(parseInt(days));

    return successResponse(res, 200, 'Trend penjualan harian berhasil diambil', trend);
  } catch (error) {
    console.error('Get daily trend error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data trend');
  }
};

// @desc    Get monthly sales trend
// @route   GET /api/reports/monthly-trend
// @access  Private
export const getMonthlySalesTrend = async (req, res) => {
  try {
    const trend = await Report.getMonthlySalesTrend();

    return successResponse(res, 200, 'Trend penjualan bulanan berhasil diambil', trend);
  } catch (error) {
    console.error('Get monthly trend error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data trend');
  }
};

// @desc    Get top selling products
// @route   GET /api/reports/top-products?limit=5&startDate=&endDate=
// @access  Private
export const getTopProducts = async (req, res) => {
  try {
    const {limit = 5, startDate, endDate} = req.query;
    const products = await Report.getTopProducts(parseInt(limit), startDate, endDate);

    return successResponse(res, 200, 'Top produk berhasil diambil', products);
  } catch (error) {
    console.error('Get top products error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data produk');
  }
};

// @desc    Get sales by category
// @route   GET /api/reports/sales-by-category?startDate=&endDate=
// @access  Private
export const getSalesByCategory = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;
    const categories = await Report.getSalesByCategory(startDate, endDate);

    return successResponse(res, 200, 'Penjualan per kategori berhasil diambil', categories);
  } catch (error) {
    console.error('Get sales by category error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data kategori');
  }
};

// @desc    Get low stock products
// @route   GET /api/reports/low-stock?threshold=10
// @access  Private
export const getLowStockProducts = async (req, res) => {
  try {
    const {threshold = 10} = req.query;
    const products = await Report.getLowStockProducts(parseInt(threshold));

    return successResponse(res, 200, 'Produk stok menipis berhasil diambil', products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data stok');
  }
};

// @desc    Get overall statistics
// @route   GET /api/reports/overall-stats
// @access  Private
export const getOverallStats = async (req, res) => {
  try {
    const stats = await Report.getOverallStats();

    return successResponse(res, 200, 'Statistik keseluruhan berhasil diambil', stats);
  } catch (error) {
    console.error('Get overall stats error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil statistik');
  }
};

// @desc    Get product performance
// @route   GET /api/reports/product-performance?startDate=&endDate=
// @access  Private
export const getProductPerformance = async (req, res) => {
  try {
    const {startDate, endDate} = req.query;
    const performance = await Report.getProductPerformance(startDate, endDate);

    return successResponse(res, 200, 'Performa produk berhasil diambil', performance);
  } catch (error) {
    console.error('Get product performance error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data performa');
  }
};

// @desc    Get comprehensive dashboard data
// @route   GET /api/reports/dashboard?period=7days
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const {period = '7days'} = req.query;

    // Calculate date range based on period
    let startDate, endDate;
    const today = new Date();
    endDate = today.toISOString().split('T')[0];

    switch (period) {
      case 'today':
        startDate = endDate;
        break;
      case '7days':
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
        break;
      default:
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    }

    // Fetch all data in parallel
    const [salesStats, profitStats, topProducts, categoryData, dailyTrend, latestSaldo] = await Promise.all([
      Report.getSalesStats(startDate, endDate),
      Report.getProfitStats(startDate, endDate),
      Report.getTopProducts(5, startDate, endDate),
      Report.getSalesByCategory(startDate, endDate),
      Report.getDailySalesTrend(period === 'today' ? 1 : 7),
      Report.getLatestSaldoKoperasi(),
    ]);

    const dashboardData = {
      period,
      date_range: {startDate, endDate},
      sales_stats: {
        ...salesStats,
        total_revenue: profitStats.total_revenue,
        total_cost: profitStats.total_cost,
        total_profit: profitStats.total_profit,
        profit_margin: profitStats.total_revenue > 0 ? ((profitStats.total_profit / profitStats.total_revenue) * 100).toFixed(2) : 0,
      },
      top_products: topProducts,
      category_distribution: categoryData,
      daily_trend: dailyTrend,
      saldo_koperasi: latestSaldo,
    };

    return successResponse(res, 200, 'Data dashboard berhasil diambil', dashboardData);
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data dashboard');
  }
};
