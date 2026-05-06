import express from 'express';
import {getSalesStats, getDailySalesTrend, getMonthlySalesTrend, getTopProducts, getSalesByCategory, getLowStockProducts, getOverallStats, getProductPerformance, getDashboardData} from '../controllers/reportController.js';
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get comprehensive dashboard data
router.get('/dashboard', getDashboardData);

// Get sales statistics
router.get('/sales-stats', getSalesStats);

// Get daily sales trend
router.get('/daily-trend', getDailySalesTrend);

// Get monthly sales trend
router.get('/monthly-trend', getMonthlySalesTrend);

// Get top selling products
router.get('/top-products', getTopProducts);

// Get sales by category
router.get('/sales-by-category', getSalesByCategory);

// Get low stock products
router.get('/low-stock', getLowStockProducts);

// Get overall statistics
router.get('/overall-stats', getOverallStats);

// Get product performance
router.get('/product-performance', getProductPerformance);

export default router;
