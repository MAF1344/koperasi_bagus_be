import {pool} from '../config/database.js';

class User {
  // Get all users
  static async findAll() {
    const [rows] = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users ORDER BY created_at DESC');
    return rows;
  }

  // Get user by ID
  static async findById(id) {
    const [rows] = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  // Get user by username (with password for login)
  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  // Get user by email (with password for login)
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  // Create new user
  static async create(userData) {
    const {username, email, password, nama_lengkap, alamat, no_telepon, role, foto_profil} = userData;
    const [result] = await pool.query('INSERT INTO users (username, email, password, nama_lengkap, alamat, no_telepon, role, foto_profil) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      username,
      email,
      password,
      nama_lengkap,
      alamat || null,
      no_telepon || null,
      role || 'pengunjung',
      foto_profil || null,
    ]);
    return result.insertId;
  }

  // Update user
  static async update(id, userData) {
    const {username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active} = userData;

    const [result] = await pool.query('UPDATE users SET username = ?, email = ?, nama_lengkap = ?, alamat = ?, no_telepon = ?, role = ?, foto_profil = ?, is_active = ? WHERE id = ?', [
      username,
      email,
      nama_lengkap,
      alamat,
      no_telepon,
      role,
      foto_profil,
      is_active,
      id,
    ]);
    return result.affectedRows;
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const [result] = await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);
    return result.affectedRows;
  }

  // Delete user
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }

  // Check if username exists
  static async usernameExists(username, excludeId = null) {
    let query = 'SELECT id FROM users WHERE username = ?';
    let params = [username];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT id FROM users WHERE email = ?';
    let params = [email];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
  }

  // Get users by role
  static async findByRole(role) {
    const [rows] = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users WHERE role = ? ORDER BY created_at DESC', [role]);
    return rows;
  }

  // Get total users count
  static async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM users');
    return rows[0].total;
  }

  // Get users with pagination
  static async findWithPagination(limit, offset) {
    const [rows] = await pool.query('SELECT id, username, email, nama_lengkap, alamat, no_telepon, role, foto_profil, is_active, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows;
  }

  // Generate reset token
  static async generateResetToken(email) {
    const user = await this.findByEmail(email);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    // Generate simple token (timestamp + user id)
    const token = Buffer.from(`${user.id}-${Date.now()}-${Math.random()}`).toString('base64');

    // Store token in user record
    await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?', [token, user.id]);

    return {user, token};
  }

  // Verify reset token
  static async verifyResetToken(token) {
    const [rows] = await pool.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW() LIMIT 1', [token]);
    return rows[0];
  }

  // Reset password with token
  static async resetPasswordWithToken(token, newPassword) {
    const user = await this.verifyResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired token');
    }

    // Check if new password is same as old password
    const bcrypt = await import('bcrypt');
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new Error('Password baru tidak boleh sama dengan password lama');
    }

    await pool.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = ?', [newPassword, user.id]);

    return user;
  }
}

export default User;
