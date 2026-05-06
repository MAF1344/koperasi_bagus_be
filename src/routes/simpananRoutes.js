import express from 'express';
import {verifyToken, isAdmin, isSuperAdmin} from '../middleware/auth.js';
import {createSimpanan, getAllSimpanan, getSimpananStats, getSimpananByUser, getTotalByUser, deleteSimpanan, getRecentSimpanan} from '../controllers/simpananController.js';

const router = express.Router();

// All routes require token verification
router.use(verifyToken);

// Create new simpanan
// SuperAdmin & Admin
router.post('/', isAdmin, createSimpanan);

// Get all simpanan (Admin & SuperAdmin)
router.get('/', isAdmin, getAllSimpanan);

// Stats
router.get('/stats', isAdmin, getSimpananStats);

// Get by user
router.get('/user/:userId', isAdmin, getSimpananByUser);

// Total by user
router.get('/total/:userId', isAdmin, getTotalByUser);

// Delete simpanan (SuperAdmin only)
router.delete('/:id', isSuperAdmin, deleteSimpanan);

// Get recent simpanan
router.get('/recent', isSuperAdmin, getRecentSimpanan);

export default router;
