import express from 'express';
import {login, logout, getMe, register, changePassword} from '../controllers/authController.js';
import {verifyToken} from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register); // Remove in production or restrict

// Private routes
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getMe);
router.put('/change-password', verifyToken, changePassword);

export default router;
