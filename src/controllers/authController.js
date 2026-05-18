import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {hashPassword, comparePassword, successResponse, errorResponse} from '../utils/helpers.js';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {expiresIn: process.env.JWT_EXPIRE || '7d'},
  );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const {username, password} = req.body;

    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Username input:', username);
    console.log('Password input:', password ? '***' + password.slice(-3) : 'empty');

    // Validation
    if (!username || !password) {
      console.log('❌ Validation failed: Empty username or password');
      return errorResponse(res, 400, 'Username dan password harus diisi');
    }

    // Check if user exists (try username first, then email)
    console.log('🔍 Searching for user...');
    let user = await User.findByUsername(username);

    if (!user) {
      console.log('🔍 User not found by username, trying email...');
      user = await User.findByEmail(username); // Allow login with email
    }

    if (!user) {
      console.log('❌ User not found in database');
      return errorResponse(res, 401, 'Username atau password salah');
    }

    console.log('✅ User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });

    // Check if user is active
    if (!user.is_active) {
      console.log('❌ User is not active');
      return errorResponse(res, 403, 'Akun Anda tidak aktif. Hubungi administrator.');
    }

    // Check password
    console.log('🔐 Checking password...');
    console.log('Password from DB (first 20 chars):', user.password.substring(0, 20));
    console.log('Password input length:', password.length);

    const isPasswordValid = await comparePassword(password, user.password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Password does not match');
      return errorResponse(res, 401, 'Username atau password salah');
    }

    console.log('✅ Password match!');

    // Generate token
    const token = generateToken(user);
    console.log('✅ Token generated');

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000, // days to milliseconds
    });

    // Remove password from response
    delete user.password;

    console.log('✅ Login successful!');
    console.log('=== END LOGIN ===\n');

    return successResponse(res, 200, 'Login berhasil', {
      token,
      user,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    return errorResponse(res, 500, 'Terjadi kesalahan saat login');
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Clear cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return successResponse(res, 200, 'Logout berhasil');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat logout');
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, 'User tidak ditemukan');
    }

    return successResponse(res, 200, 'User data retrieved', user);
  } catch (error) {
    console.error('Get me error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data user');
  }
};

// @desc    Register new user (for testing only, should be removed in production)
// @route   POST /api/auth/register
// @access  Public (should be restricted)
export const register = async (req, res) => {
  try {
    const {username, email, password, nama_lengkap, alamat, no_telepon} = req.body;

    // Validation
    if (!username || !email || !password || !nama_lengkap) {
      return errorResponse(res, 400, 'Username, email, password, dan nama lengkap harus diisi');
    }

    // Check if username exists
    const usernameExists = await User.usernameExists(username);
    if (usernameExists) {
      return errorResponse(res, 400, 'Username sudah digunakan');
    }

    // Check if email exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return errorResponse(res, 400, 'Email sudah digunakan');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await User.create({
      username,
      email,
      password: hashedPassword,
      nama_lengkap,
      alamat,
      no_telepon,
      role: 'pengunjung', // Default role
    });

    // Get created user
    const user = await User.findById(userId);

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: parseInt(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, 201, 'Registrasi berhasil', {
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat registrasi');
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const {oldPassword, newPassword, confirmPassword} = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, 400, 'Semua field harus diisi');
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 400, 'Password baru dan konfirmasi password tidak cocok');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'Password minimal 6 karakter');
    }

    // Get user with password
    const user = await User.findByUsername(req.user.username);

    // Check old password
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Password lama salah');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await User.updatePassword(req.user.id, hashedPassword);

    return successResponse(res, 200, 'Password berhasil diubah');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengubah password');
  }
};
