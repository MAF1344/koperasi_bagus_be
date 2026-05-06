import User from '../models/User.js';
import {hashPassword, successResponse, errorResponse} from '../utils/helpers.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (SuperAdmin, Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    return successResponse(res, 200, 'Data users berhasil diambil', users);
  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data users');
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const {id} = req.params;

    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 404, 'User tidak ditemukan');
    }

    // Only allow user to see their own data, or admin/superadmin can see all
    if (req.user.role !== 'superadmin' && req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return errorResponse(res, 403, 'Anda tidak memiliki akses ke data user ini');
    }

    return successResponse(res, 200, 'Data user berhasil diambil', user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data user');
  }
};

// @desc    Create new user (admin/pengurus)
// @route   POST /api/users
// @access  Private (SuperAdmin only)
export const createUser = async (req, res) => {
  try {
    const {username, email, password, nama_lengkap, alamat, no_telepon, role} = req.body;

    // Validation
    if (!username || !email || !password || !nama_lengkap || !role) {
      return errorResponse(res, 400, 'Username, email, password, nama lengkap, dan role harus diisi');
    }

    // Validate role
    const validRoles = ['superadmin', 'admin', 'pengunjung'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 400, 'Role tidak valid');
    }

    // Only superadmin can create superadmin or admin
    if ((role === 'superadmin' || role === 'admin') && req.user.role !== 'superadmin') {
      return errorResponse(res, 403, 'Hanya SuperAdmin yang dapat membuat Admin atau SuperAdmin');
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
      role,
    });

    // Get created user
    const user = await User.findById(userId);

    return successResponse(res, 201, 'User berhasil dibuat', user);
  } catch (error) {
    console.error('Create user error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat membuat user');
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (SuperAdmin or own profile)
export const updateUser = async (req, res) => {
  try {
    const {id} = req.params;
    const {username, email, nama_lengkap, alamat, no_telepon, role, is_active} = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return errorResponse(res, 404, 'User tidak ditemukan');
    }

    // Check permissions
    const isSuperAdmin = req.user.role === 'superadmin';
    const isOwnProfile = req.user.id === parseInt(id);

    if (!isSuperAdmin && !isOwnProfile) {
      return errorResponse(res, 403, 'Anda tidak memiliki akses untuk mengubah data user ini');
    }

    // Only superadmin can change role and is_active
    // If not superadmin, preserve existing values
    const updateData = {
      username,
      email,
      nama_lengkap,
      alamat,
      no_telepon,
      role: isSuperAdmin && role !== undefined ? role : existingUser.role,
      foto_profil: existingUser.foto_profil,
      is_active: isSuperAdmin && is_active !== undefined ? is_active : existingUser.is_active,
    };

    // Validation
    if (!username || !email || !nama_lengkap) {
      return errorResponse(res, 400, 'Username, email, dan nama lengkap harus diisi');
    }

    // Check if username exists (exclude current user)
    const usernameExists = await User.usernameExists(username, id);
    if (usernameExists) {
      return errorResponse(res, 400, 'Username sudah digunakan');
    }

    // Check if email exists (exclude current user)
    const emailExists = await User.emailExists(email, id);
    if (emailExists) {
      return errorResponse(res, 400, 'Email sudah digunakan');
    }

    // Update user
    await User.update(id, updateData);

    // Get updated user
    const updatedUser = await User.findById(id);

    return successResponse(res, 200, 'Data user berhasil diperbarui', updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat memperbarui data user');
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (SuperAdmin only)
export const deleteUser = async (req, res) => {
  try {
    const {id} = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, 'User tidak ditemukan');
    }

    // Prevent deleting own account
    if (req.user.id === parseInt(id)) {
      return errorResponse(res, 400, 'Anda tidak dapat menghapus akun Anda sendiri');
    }

    // Prevent deleting superadmin
    if (user.role === 'superadmin') {
      return errorResponse(res, 400, 'Akun SuperAdmin tidak dapat dihapus');
    }

    // Delete user
    await User.delete(id);

    return successResponse(res, 200, 'User berhasil dihapus');
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menghapus user');
  }
};

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private (Admin, SuperAdmin)
export const getUsersByRole = async (req, res) => {
  try {
    const {role} = req.params;

    // Validate role
    const validRoles = ['superadmin', 'admin', 'pengunjung'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, 400, 'Role tidak valid');
    }

    const users = await User.findByRole(role);

    return successResponse(res, 200, `Data users dengan role ${role} berhasil diambil`, users);
  } catch (error) {
    console.error('Get users by role error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data users');
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin, SuperAdmin)
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const superadmins = await User.findByRole('superadmin');
    const admins = await User.findByRole('admin');
    const pengunjung = await User.findByRole('pengunjung');

    const stats = {
      total: totalUsers,
      superadmin: superadmins.length,
      admin: admins.length,
      pengunjung: pengunjung.length,
    };

    return successResponse(res, 200, 'Statistik users berhasil diambil', stats);
  } catch (error) {
    console.error('Get user stats error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil statistik users');
  }
};
