import Simpanan from '../models/Simpanan.js';
import Anggota from '../models/Anggota.js';

/**
 * Validasi input simpanan
 */
const validateSimpananInput = (anggota_id, jenis_simpanan, jumlah) => {
  const errors = [];

  if (!anggota_id) errors.push('Anggota harus dipilih');
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
    const {anggota_id, jenis_simpanan, jumlah, keterangan} = req.body;

    const validationErrors = validateSimpananInput(anggota_id, jenis_simpanan, jumlah);
    if (validationErrors.length > 0) {
      return sendResponse(res, 400, false, validationErrors.join(', '));
    }

    const anggota = await Anggota.findById(anggota_id);
    if (!anggota) {
      return sendResponse(res, 404, false, 'Anggota tidak ditemukan');
    }

    if (jenis_simpanan === 'pokok') {
      const existingPokok = await Simpanan.findByAnggotaAndType(anggota_id, 'pokok');
      if (existingPokok.length > 0) {
        return sendResponse(res, 400, false, 'Simpanan pokok sudah ada untuk anggota ini. Simpanan pokok hanya sekali.');
      }
    }

    const simpananData = {
      anggota_id,
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
    const {jenis_simpanan, anggota_id} = req.query;
    let simpanan;

    if (jenis_simpanan) {
      simpanan = await Simpanan.findByJenis(jenis_simpanan);
    } else if (anggota_id) {
      simpanan = await Simpanan.findByAnggota(anggota_id);
    } else {
      simpanan = await Simpanan.findAll();
    }

    return sendResponse(res, 200, true, 'Data simpanan berhasil diambil', simpanan);
  } catch (error) {
    console.error('Error getting simpanan:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat mengambil data simpanan', null, error.message);
  }
};

/**
 * Get simpanan by anggota ID
 * GET /api/simpanan/user/:userId
 */
export const getSimpananByUser = async (req, res) => {
  try {
    const {userId} = req.params;
    const simpanan = await Simpanan.findByAnggota(userId);

    return sendResponse(res, 200, true, 'Data simpanan anggota berhasil diambil', simpanan);
  } catch (error) {
    console.error('Error getting simpanan by anggota:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat mengambil data simpanan', null, error.message);
  }
};

/**
 * Get simpanan statistics
 * GET /api/simpanan/stats
 */
export const getSimpananStats = async (req, res) => {
  try {
    const stats = await Simpanan.getStats();
    return sendResponse(res, 200, true, 'Statistik simpanan berhasil diambil', stats);
  } catch (error) {
    console.error('Error getting simpanan stats:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat mengambil statistik simpanan', null, error.message);
  }
};

/**
 * Get total simpanan by anggota
 * GET /api/simpanan/total/:userId
 */
export const getTotalByUser = async (req, res) => {
  try {
    const {userId} = req.params;
    const totals = await Simpanan.calculateTotalByAnggota(userId);

    return sendResponse(res, 200, true, 'Total simpanan berhasil dihitung', {
      anggota_id: parseInt(userId),
      ...totals,
    });
  } catch (error) {
    console.error('Error getting total simpanan by anggota:', error);
    return sendResponse(res, 500, false, 'Terjadi kesalahan saat menghitung total simpanan', null, error.message);
  }
};

/**
 * Get recent simpanan
 * GET /api/simpanan/recent?limit=10
 */
export const getRecentSimpanan = async (req, res) => {
  try {
    const {limit = 10} = req.query;
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

    if (req.user.role !== 'superadmin') {
      return sendResponse(res, 403, false, 'Hanya SuperAdmin yang dapat menghapus simpanan');
    }

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
