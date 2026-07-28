import Siswa from '../models/Siswa.js';
import Anggota from '../models/Anggota.js';
import {successResponse, errorResponse} from '../utils/helpers.js';

export const getAllSiswa = async (req, res) => {
  try {
    const siswa = await Siswa.findAll();
    return successResponse(res, 200, 'Data siswa berhasil diambil', siswa);
  } catch (error) {
    console.error('Get all siswa error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data siswa');
  }
};

export const getSiswaById = async (req, res) => {
  try {
    const {id} = req.params;
    const siswa = await Siswa.findById(id);

    if (!siswa) {
      return errorResponse(res, 404, 'Siswa tidak ditemukan');
    }

    return successResponse(res, 200, 'Data siswa berhasil diambil', siswa);
  } catch (error) {
    console.error('Get siswa by ID error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat mengambil data siswa');
  }
};

export const createSiswa = async (req, res) => {
  try {
    const {anggota_id, nisn, nama_siswa, kelas, sekolah} = req.body;

    if (!anggota_id || !nama_siswa) {
      return errorResponse(res, 400, 'Anggota dan nama siswa harus diisi');
    }

    const anggota = await Anggota.findById(anggota_id);
    if (!anggota) {
      return errorResponse(res, 404, 'Anggota tidak ditemukan');
    }

    const id = await Siswa.create({anggota_id, nisn, nama_siswa, kelas, sekolah});
    const created = await Siswa.findById(id);
    return successResponse(res, 201, 'Data siswa berhasil dibuat', created);
  } catch (error) {
    console.error('Create siswa error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menambahkan data siswa');
  }
};

export const updateSiswa = async (req, res) => {
  try {
    const {id} = req.params;
    const existingSiswa = await Siswa.findById(id);

    if (!existingSiswa) {
      return errorResponse(res, 404, 'Siswa tidak ditemukan');
    }

    const {anggota_id, nisn, nama_siswa, kelas, sekolah} = req.body;

    if (!anggota_id || !nama_siswa) {
      return errorResponse(res, 400, 'Anggota dan nama siswa harus diisi');
    }

    const anggota = await Anggota.findById(anggota_id);
    if (!anggota) {
      return errorResponse(res, 404, 'Anggota tidak ditemukan');
    }

    await Siswa.update(id, {anggota_id, nisn, nama_siswa, kelas, sekolah});
    const updated = await Siswa.findById(id);
    return successResponse(res, 200, 'Data siswa berhasil diperbarui', updated);
  } catch (error) {
    console.error('Update siswa error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat memperbarui data siswa');
  }
};

export const deleteSiswa = async (req, res) => {
  try {
    const {id} = req.params;
    const existingSiswa = await Siswa.findById(id);

    if (!existingSiswa) {
      return errorResponse(res, 404, 'Siswa tidak ditemukan');
    }

    await Siswa.delete(id);
    return successResponse(res, 200, 'Data siswa berhasil dihapus');
  } catch (error) {
    console.error('Delete siswa error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan saat menghapus data siswa');
  }
};
