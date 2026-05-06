import express from 'express';
import {getAllUsers, getUserById, createUser, updateUser, deleteUser, getUsersByRole, getUserStats} from '../controllers/userController.js';
import {verifyToken, isSuperAdmin, isAdmin} from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Admin and SuperAdmin can view all users
router.get('/', isAdmin, getAllUsers);

// Get user statistics
router.get('/stats', isAdmin, getUserStats);

// Get users by role
router.get('/role/:role', isAdmin, getUsersByRole);

// Get user by ID (own profile or admin/superadmin)
router.get('/:id', getUserById);

// Only SuperAdmin can create users (admin/pengurus)
router.post('/', isSuperAdmin, createUser);

// Update user (own profile or superadmin)
router.put('/:id', updateUser);

// Only SuperAdmin can delete users
router.delete('/:id', isSuperAdmin, deleteUser);

export default router;
