import Simpanan from '../models/Simpanan.js';
import User from '../models/User.js';

// ==================== HELPER FUNCTIONS ====================

/**
 * Validasi input simpanan
 */
const validateSimpananInput = (user_id, jenis_simpanan, jumlah) => {
  const errors = [];

  if (!user_id) errors.push('User ID wajib diisi');
  if (!jenis_simpanan) errors.push('Jenis simpanan wajib diisi');
  if (!jumlah) errors.push('Jumlah wajib diisi');

  if (jenis_simpanan) {
    const validTypes = ['pokok', 'wajib', 'sukarela'];
    if (!validTypes.includes(jenis_simpanan)) {
      errors.push('Jenis simpanan harus: pokok, wajib, atau sukarela');
    }
  }

  if (jumlah && jumlah <= 0) {
    errors.push('Jumlah simpanan harus lebih dari 0');
  }

  return errors;
};

/**
 * Cek akses user berdasarkan role
 */
const checkUserAccess = (reqUser, targetUserId, action = 'view') => {
  // Superadmin bisa mengakses semua
  if (reqUser.role === 'superadmin') return {allowed: true};

  // Admin hanya bisa mengakses data sendiri
  if (reqUser.role === 'admin') {
    if (targetUserId && targetUserId !== reqUser.id) {
      return {
        allowed: false,
        message: `Admin hanya dapat ${action} data simpanan untuk diri sendiri`,
      };
    }
    return {allowed: true};
  }

  // Role lain tidak diizinkan
  return {
    allowed: false,
    message: 'Anda tidak memiliki akses ke fitur ini',
  };
};

/**
 * Response handler seragam
 */
const sendResponse = (res, status, success, message, data = null, error = null) => {
  const response = {success, message};
  if (data) response.data = data;
  if (error) response.error = error;
  return res.status(status).json(response);
};

// ==================== MAIN CONTROLLER FUNCTIONS ====================

/**
 * Create new simpanan (deposit)
 * POST /api/simpanan
 */
export const createSimpanan = async (req, res) => {
  try {
    const {user_id, jenis_simpanan, jumlah, keterangan} = req.body;

    // Validasi input
    const validationErrors = validateSimpananInput(user_id, jenis_simpanan, jumlah);
    if (validationErrors.length > 0) {
      return sendResponse(res, 400, false, validationErrors.join(', '));
    }

    // Cek apakah user target ada dan eligible
    const user = await User.findById(user_id);
    if (!user) {
      return sendResponse(res, 404, false, 'User tidak ditemukan');
    }

    if (user.role === 'pengunjung') {
      return sendResponse(res, 403, false, 'Pengunjung tidak dapat memiliki simpanan');
    }

    // Cek akses berdasarkan role
    const accessCheck = checkUserAccess(req.user, user_id, 'menambah');
    if (!accessCheck.allowed) {
      return sendResponse(res, 403, false, accessCheck.message);
    }

    // Validasi khusus untuk simpanan pokok (hanya sekali)
    if (jenis_simpanan === 'pokok') {
      const existingPokok = await Simpanan.findByUserAndType(user_id, 'pokok');
      if (existingPokok.length > 0) {
        return sendResponse(res, 400, false, 'Simpanan pokok sudah ada untuk anggota ini. Simpanan pokok hanya sekali.');
      }
    }

    // Buat data simpanan
    const simpananData = {
      user_id,
      jenis_simpanan,
      jumlah,
      keterangan: keterangan || null,
      tanggal_simpanan: new Date(),
    };

    const simpananId = await Simpanan.create(simpananData);

    return sendResponse(res, 201, true, 'Simpanan berhasil ditambahkan', {
      id: simpananId,
      ...simpananData,
    });
  } catch (error) {
    console.error('Error creating simpanan:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat menambah simpanan', null, error.message);
  }
};

/**
 * Get all simpanan with filters
 * GET /api/simpanan
 */
export const getAllSimpanan = async (req, res) => {
  try {
    const {jenis_simpanan, user_id} = req.query;
    let simpanan;

    // Admin hanya bisa melihat data sendiri
    if (req.user.role === 'admin') {
      simpanan = await Simpanan.findByUser(req.user.id);
    }
    // Superadmin bisa melihat semua dengan filter
    else {
      if (jenis_simpanan) {
        simpanan = await Simpanan.findByJenis(jenis_simpanan);
      } else if (user_id) {
        simpanan = await Simpanan.findByUser(user_id);
      } else {
        simpanan = await Simpanan.findAll();
      }
    }

    return sendResponse(res, 200, true, 'Data simpanan berhasil diambil', simpanan);
  } catch (error) {
    console.error('Error getting simpanan:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat mengambil data simpanan', null, error.message);
  }
};

/**
 * Get simpanan by user ID
 * GET /api/simpanan/user/:userId
 */
export const getSimpananByUser = async (req, res) => {
  try {
    const {userId} = req.params;

    // Cek akses
    const accessCheck = checkUserAccess(req.user, parseInt(userId));
    if (!accessCheck.allowed) {
      return sendResponse(res, 403, false, accessCheck.message);
    }

    const simpanan = await Simpanan.findByUser(userId);

    return sendResponse(res, 200, true, 'Data simpanan user berhasil diambil', simpanan);
  } catch (error) {
    console.error('Error getting simpanan by user:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat mengambil data simpanan', null, error.message);
  }
};

/**
 * Get simpanan statistics
 * GET /api/simpanan/stats
 */
export const getSimpananStats = async (req, res) => {
  try {
    let stats;

    // Admin hanya melihat statistik sendiri
    if (req.user.role === 'admin') {
      stats = await Simpanan.getStatsByUser(req.user.id);
    }
    // Superadmin melihat statistik semua
    else {
      stats = await Simpanan.getStats();
    }

    return sendResponse(res, 200, true, 'Statistik simpanan berhasil diambil', stats);
  } catch (error) {
    console.error('Error getting simpanan stats:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat mengambil statistik simpanan', null, error.message);
  }
};

/**
 * Get total simpanan by user
 * GET /api/simpanan/total/:userId
 */
export const getTotalByUser = async (req, res) => {
  try {
    const {userId} = req.params;

    // Cek akses
    const accessCheck = checkUserAccess(req.user, parseInt(userId));
    if (!accessCheck.allowed) {
      return sendResponse(res, 403, false, accessCheck.message);
    }

    const totals = await Simpanan.calculateTotalByUser(userId);

    return sendResponse(res, 200, true, 'Total simpanan berhasil dihitung', {
      user_id: parseInt(userId),
      ...totals,
    });
  } catch (error) {
    console.error('Error getting total simpanan by user:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat menghitung total simpanan', null, error.message);
  }
};

/**
 * Get recent simpanan
 * GET /api/simpanan/recent/:limit?
 */
// Di simpananController.js - perbaiki fungsi getRecentSimpanan
export const getRecentSimpanan = async (req, res) => {
  try {
    // Ambil dari query parameter, bukan params
    const {limit = 10} = req.query;

    // Hanya superadmin yang bisa melihat recent semua simpanan
    if (req.user.role !== 'superadmin') {
      return sendResponse(res, 403, false, 'Hanya SuperAdmin yang dapat mengakses data ini');
    }

    const recentSimpanan = await Simpanan.getRecent(parseInt(limit));

    return sendResponse(res, 200, true, 'Data simpanan terbaru berhasil diambil', recentSimpanan);
  } catch (error) {
    console.error('Error getting recent simpanan:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat mengambil data simpanan terbaru', null, error.message);
  }
};

/**
 * Delete simpanan (SuperAdmin only, for corrections)
 * DELETE /api/simpanan/:id
 */
export const deleteSimpanan = async (req, res) => {
  try {
    const {id} = req.params;

    // Only SuperAdmin can delete
    if (req.user.role !== 'superadmin') {
      return sendResponse(res, 403, false, 'Hanya SuperAdmin yang dapat menghapus simpanan');
    }

    // Check if simpanan exists
    const simpanan = await Simpanan.findById(id);
    if (!simpanan) {
      return sendResponse(res, 404, false, 'Simpanan tidak ditemukan');
    }

    await Simpanan.delete(id);

    return sendResponse(res, 200, true, 'Simpanan berhasil dihapus');
  } catch (error) {
    console.error('Error deleting simpanan:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat menghapus simpanan', null, error.message);
  }
};
