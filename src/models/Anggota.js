import {pool} from '../config/database.js';

class Anggota {
  static async findAll() {
    const {rows} = await pool.query(
      `SELECT id, user_id, nomor_anggota, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon, status, created_at, updated_at FROM anggota ORDER BY created_at DESC`,
    );
    return rows;
  }

  static async findById(id) {
    const {rows} = await pool.query(
      `SELECT id, user_id, nomor_anggota, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon, status, created_at, updated_at FROM anggota WHERE id = $1`,
      [id],
    );
    return rows[0];
  }

  static async create(data) {
    const {user_id, nomor_anggota, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon, status} = data;
    const {rows} = await pool.query(
      `INSERT INTO anggota (user_id, nomor_anggota, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
      [user_id || null, nomor_anggota, nama_lengkap, jenis_kelamin || null, tempat_lahir || null, tanggal_lahir || null, alamat || null, no_telepon || null, status || 'baru'],
    );
    return rows[0].id;
  }

  static async update(id, data) {
    const {user_id, nomor_anggota, nama_lengkap, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, no_telepon, status} = data;
    const result = await pool.query(
      `UPDATE anggota SET user_id = $1, nomor_anggota = $2, nama_lengkap = $3, jenis_kelamin = $4, tempat_lahir = $5, tanggal_lahir = $6, alamat = $7, no_telepon = $8, status = $9, updated_at = NOW() WHERE id = $10`,
      [user_id || null, nomor_anggota, nama_lengkap, jenis_kelamin || null, tempat_lahir || null, tanggal_lahir || null, alamat || null, no_telepon || null, status || 'baru', id],
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM anggota WHERE id = $1', [id]);
    return result.rowCount;
  }
}

export default Anggota;
