import express from 'express';
import {verifyToken, isAdmin, isSuperAdmin} from '../middleware/auth.js';
import {getAngsuranStats, getOverdueAngsuran, getUpcomingPayments, getAngsuranByPinjaman, recordPayment, updateKeterangan} from '../controllers/angsuranController.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get angsuran statistics (Admin & SuperAdmin)
router.get('/stats', isAdmin, getAngsuranStats);

// Get overdue angsuran (Admin & SuperAdmin)
router.get('/overdue', isAdmin, getOverdueAngsuran);

// Get upcoming payments (Admin & SuperAdmin)
router.get('/upcoming', isAdmin, getUpcomingPayments);

// Get payment schedule by pinjaman ID (Admin & SuperAdmin)
router.get('/pinjaman/:pinjamanId', isAdmin, getAngsuranByPinjaman);

// Record payment for an angsuran (Admin & SuperAdmin)
router.put('/:id/pay', isAdmin, recordPayment);

// Update keterangan (SuperAdmin only)
router.put('/:id/keterangan', isSuperAdmin, updateKeterangan);

export default router;
