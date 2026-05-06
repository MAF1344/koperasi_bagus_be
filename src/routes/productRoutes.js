import express from 'express';
import {getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByCategory, getProductStats, searchProducts, updateStock} from '../controllers/productController.js';
import {verifyToken, isAdmin} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin/superadmin role
router.use(verifyToken);
router.use(isAdmin);

// Get product statistics
router.get('/stats', getProductStats);

// Search products
router.get('/search', searchProducts);

// Get products by category
router.get('/category/:category', getProductsByCategory);

// Get all products
router.get('/', getAllProducts);

// Get product by ID
router.get('/:id', getProductById);

// Create new product
router.post('/', createProduct);

// Update product
router.put('/:id', updateProduct);

// Update product stock
router.patch('/:id/stock', updateStock);

// Delete product
router.delete('/:id', deleteProduct);

export default router;
