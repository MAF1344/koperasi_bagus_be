import Anggota from '../models/Anggota.js';
import {successResponse, errorResponse} from '../utils/helpers.js';

export const getAllAnggota = async (req, res) => {
  try {
    const anggota = await Anggota.findAll();
    return successResponse(res, 200, 'Data anggota berhasil diambil', anggota);
  } catch (error) {
    console.error('Get all anggota error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data anggota');
  }
};

export const getAnggotaById = async (req, res) => {
  try {
    const {id} = req.params;
    const anggota = await Anggota.findById(id);

    if (!anggota) {
      return errorResponse(res, 404, 'Anggota tidak ditemukan');
    }

    return successResponse(res, 200, 'Data anggota berhasil diambil', anggota);
  } catch (error) {
    console.error('Get anggota by ID error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data anggota');
  }
};

export const createAnggota = async (req, res) => {
  try {
    const {user_id, nomor_anggota, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon, status} = req.body;

    if (!nomor_anggota || !nama_lengkap) {
      return errorResponse(res, 400, 'Nomor anggota dan nama lengkap harus diisi');
    }

    const id = await Anggota.create({
      user_id,
      nomor_anggota,
      nama_lengkap,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      no_telepon,
      status,
    });

    const created = await Anggota.findById(id);
    return successResponse(res, 201, 'Anggota berhasil dibuat', created);
  } catch (error) {
    console.error('Create anggota error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menambahkan anggota');
  }
};

export const updateAnggota = async (req, res) => {
  try {
    const {id} = req.params;
    const existingAnggota = await Anggota.findById(id);

    if (!existingAnggota) {
      return errorResponse(res, 404, 'Anggota tidak ditemukan');
    }

    const {user_id, nomor_anggota, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon, status} = req.body;

    if (!nomor_anggota || !nama_lengkap) {
      return errorResponse(res, 400, 'Nomor anggota dan nama lengkap harus diisi');
    }

    await Anggota.update(id, {
      user_id,
      nomor_anggota,
      nama_lengkap,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      no_telepon,
      status,
    });

    const updated = await Anggota.findById(id);
    return successResponse(res, 200, 'Data anggota berhasil diperbarui', updated);
  } catch (error) {
    console.error('Update anggota error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat memperbarui data anggota');
  }
};

export const deleteAnggota = async (req, res) => {
  try {
    const {id} = req.params;
    const existingAnggota = await Anggota.findById(id);

    if (!existingAnggota) {
      return errorResponse(res, 404, 'Anggota tidak ditemukan');
    }

    await Anggota.delete(id);
    return successResponse(res, 200, 'Anggota berhasil dihapus');
  } catch (error) {
    console.error('Delete anggota error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menghapus anggota');
  }
};
