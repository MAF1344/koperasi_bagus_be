import express from 'express';
import {verifyToken, isAdmin, isSuperAdmin} from '../middleware/auth.js';
import {createPinjaman, getAllPinjaman, getPinjamanStats, getPendingPinjaman, getPinjamanByUser, getPinjamanById, approvePinjaman, rejectPinjaman, deletePinjaman} from '../controllers/pinjamanController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Create new pinjaman (Admin & SuperAdmin)
router.post('/', isAdmin, createPinjaman);

// Get all pinjaman with filters (Admin & SuperAdmin)
router.get('/', isAdmin, getAllPinjaman);

// Get pinjaman statistics (all authenticated users)
router.get('/stats', getPinjamanStats);

// Get pending pinjaman (SuperAdmin only)
router.get('/pending', isSuperAdmin, getPendingPinjaman);

// Get pinjaman by user ID (Admin & SuperAdmin)
router.get('/user/:userId', isAdmin, getPinjamanByUser);

// Get pinjaman detail by ID (Admin & SuperAdmin)
router.get('/:id', isAdmin, getPinjamanById);

// Approve pinjaman (SuperAdmin only)
router.put('/:id/approve', isSuperAdmin, approvePinjaman);

// Reject pinjaman (SuperAdmin only)
router.put('/:id/reject', isSuperAdmin, rejectPinjaman);

// Delete pinjaman (SuperAdmin only, pending only)
router.delete('/:id', isSuperAdmin, deletePinjaman);

export default router;
