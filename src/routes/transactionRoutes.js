import express from 'express';
import {getAllTransactions, getTransactionById, createTransaction, getTransactionsByDateRange, getTodayTransactions, getTransactionStats, getDailySales, searchTransactions} from '../controllers/transactionController.js';
import {verifyToken, isAdmin} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin/superadmin role
router.use(verifyToken);
router.use(isAdmin);

// Get transaction statistics
router.get('/stats', getTransactionStats);

// Get daily sales
router.get('/daily-sales', getDailySales);

// Get today's transactions
router.get('/today', getTodayTransactions);

// Search transactions
router.get('/search', searchTransactions);

// Get transactions by date range
router.get('/date-range', getTransactionsByDateRange);

// Get all transactions
router.get('/', getAllTransactions);

// Get transaction by ID
router.get('/:id', getTransactionById);

// Create new transaction
router.post('/', createTransaction);

export default router;
