import {pool} from '../config/database.js';

class Siswa {
  static async findAll() {
    const {rows} = await pool.query(
      `SELECT s.id, s.anggota_id, s.nisn, s.nama_siswa, s.kelas, s.sekolah, s.created_at, s.updated_at, a.nomor_anggota, a.nama_lengkap AS anggota_nama
       FROM siswa s
       LEFT JOIN anggota a ON s.anggota_id = a.id
       ORDER BY s.created_at DESC`,
    );
    return rows;
  }

  static async findById(id) {
    const {rows} = await pool.query(
      `SELECT s.id, s.anggota_id, s.nisn, s.nama_siswa, s.kelas, s.sekolah, s.created_at, s.updated_at, a.nomor_anggota, a.nama_lengkap AS anggota_nama
       FROM siswa s
       LEFT JOIN anggota a ON s.anggota_id = a.id
       WHERE s.id = $1`,
      [id],
    );
    return rows[0];
  }

  static async findByAnggotaId(anggotaId) {
    const {rows} = await pool.query(
      `SELECT s.id, s.anggota_id, s.nisn, s.nama_siswa, s.kelas, s.sekolah, s.created_at, s.updated_at, a.nomor_anggota, a.nama_lengkap AS anggota_nama
       FROM siswa s
       LEFT JOIN anggota a ON s.anggota_id = a.id
       WHERE s.anggota_id = $1
       ORDER BY s.created_at DESC`,
      [anggotaId],
    );
    return rows;
  }

  static async create(data) {
    const {anggota_id, nisn, nama_siswa, kelas, sekolah} = data;
    const {rows} = await pool.query(
      `INSERT INTO siswa (anggota_id, nisn, nama_siswa, kelas, sekolah, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
      [anggota_id, nisn || null, nama_siswa, kelas || null, sekolah || null],
    );
    return rows[0].id;
  }

  static async update(id, data) {
    const {anggota_id, nisn, nama_siswa, kelas, sekolah} = data;
    const result = await pool.query(
      `UPDATE siswa SET anggota_id = $1, nisn = $2, nama_siswa = $3, kelas = $4, sekolah = $5, updated_at = NOW() WHERE id = $6`,
      [anggota_id, nisn || null, nama_siswa, kelas || null, sekolah || null, id],
    );
    return result.rowCount;
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM siswa WHERE id = $1', [id]);
    return result.rowCount;
  }
}

export default Siswa;
