import {pool} from '../config/database.js';

class User {
  // Get all users
  static async findAll() {
    const {rows} = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users ORDER BY created_at DESC');
    return rows;
  }

  // Get user by ID
  static async findById(id) {
    const {rows} = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users WHERE id = $1', [id]);
    return rows[0];
  }

  // Get user by username (with password for login)
  static async findByUsername(username) {
    const {rows} = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return rows[0];
  }

  // Get user by email (with password for login)
  static async findByEmail(email) {
    const {rows} = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  // Create new user
  static async create(userData) {
    const {username, email, password, nama_lengkap, alamat, no_telepon, role, foto_profil} = userData;
    const {rows} = await pool.query(
      'INSERT INTO users (username, email, password, nama_lengkap, alamat, no_telepon, role, foto_profil) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [
        username,
        email,
        password,
        nama_lengkap,
        alamat || null,
        no_telepon || null,
        role || 'pengunjung',
        foto_profil || null,
      ]
    );
    return rows[0].id;
  }

  // Update user
  static async update(id, userData) {
    const {username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active} = userData;

    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, nama_lengkap = $3, alamat = $4, no_telepon = $5, role = $6, foto_profil = $7, is_active = $8 WHERE id = $9',
      [
        username,
        email,
        nama_lengkap,
        alamat,
        no_telepon,
        role,
        foto_profil,
        is_active,
        id,
      ]
    );
    return result.rowCount;
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const result = await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, id]);
    return result.rowCount;
  }

  // Update reset password token
  static async updateResetToken(id, token, expire) {
    const result = await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE id = $3',
      [token, expire, id]
    );
    return result.rowCount;
  }

  // Find user by reset token
  static async findByResetToken(token) {
    const {rows} = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()',
      [token]
    );
    return rows[0];
  }

  // Delete user
  static async delete(id) {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount;
  }

  // Check if username exists
  static async usernameExists(username, excludeId = null) {
    let query = 'SELECT id FROM users WHERE username = $1';
    let params = [username];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    const {rows} = await pool.query(query, params);
    return rows.length > 0;
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT id FROM users WHERE email = $1';
    let params = [email];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    const {rows} = await pool.query(query, params);
    return rows.length > 0;
  }

  // Get users by role
  static async findByRole(role) {
    const {rows} = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users WHERE role = $1 ORDER BY created_at DESC', [role]);
    return rows;
  }

  // Get total users count
  static async count() {
    const {rows} = await pool.query('SELECT COUNT(*) as total FROM users');
    return parseInt(rows[0].total);
  }

  // Get users with pagination
  static async findWithPagination(limit, offset) {
    const {rows} = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
    return rows;
  }
}

export default User;
