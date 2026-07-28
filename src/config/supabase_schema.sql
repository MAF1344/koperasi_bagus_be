-- PostgreSQL schema for Koperasi BAGUS (development-friendly version)
-- This file is intended for fresh local database creation.
-- For structural changes, recreate the database and run this file again.

CREATE TYPE role_type AS ENUM ('superadmin', 'admin', 'pengunjung');
CREATE TYPE product_category AS ENUM ('buku', 'seragam', 'atk');
CREATE TYPE loan_status AS ENUM ('pending', 'approved', 'rejected', 'lunas');
CREATE TYPE installment_status AS ENUM ('belum_bayar', 'sudah_bayar', 'terlambat');
CREATE TYPE saving_type AS ENUM ('pokok', 'wajib', 'sukarela');
CREATE TYPE saving_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_method AS ENUM ('tunai', 'transfer');
CREATE TYPE anggota_status AS ENUM ('aktif', 'nonaktif', 'baru');
CREATE TYPE bagi_hasil_status AS ENUM ('pending', 'approved', 'released');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    alamat TEXT,
    no_telepon VARCHAR(20),
    role role_type DEFAULT 'pengunjung',
    foto_profil VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    reset_password_token VARCHAR(255),
    reset_password_expire TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS anggota (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    nomor_anggota VARCHAR(30) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    jenis_kelamin VARCHAR(20),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    alamat TEXT,
    no_telepon VARCHAR(20),
    status anggota_status DEFAULT 'baru',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS siswa (
    id SERIAL PRIMARY KEY,
    anggota_id INT REFERENCES anggota(id) ON DELETE CASCADE,
    nisn VARCHAR(30) UNIQUE,
    nama_siswa VARCHAR(150) NOT NULL,
    kelas VARCHAR(50),
    sekolah VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nama_produk VARCHAR(150) NOT NULL,
    kategori product_category NOT NULL,
    deskripsi TEXT,
    harga_beli DECIMAL(15, 2) NOT NULL,
    harga_jual DECIMAL(15, 2) NOT NULL,
    stok INT DEFAULT 0,
    satuan VARCHAR(20) DEFAULT 'pcs',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    kode_transaksi VARCHAR(50) UNIQUE NOT NULL,
    tanggal_transaksi TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_harga DECIMAL(15, 2) NOT NULL,
    total_bayar DECIMAL(15, 2) NOT NULL,
    kembalian DECIMAL(15, 2) DEFAULT 0.00,
    metode_pembayaran payment_method DEFAULT 'tunai',
    catatan TEXT,
    kasir_id INT REFERENCES users(id) ON DELETE SET NULL,
    anggota_id INT REFERENCES anggota(id) ON DELETE SET NULL,
    nama_pelanggan VARCHAR(100) DEFAULT 'Umum',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_details (
    id SERIAL PRIMARY KEY,
    transaction_id INT REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    nama_produk VARCHAR(150) NOT NULL,
    harga_satuan DECIMAL(15, 2) NOT NULL,
    jumlah INT NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS simpanan (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    anggota_id INT REFERENCES anggota(id) ON DELETE SET NULL,
    jenis_simpanan saving_type NOT NULL,
    jumlah DECIMAL(15, 2) NOT NULL,
    tanggal_simpanan TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    keterangan TEXT,
    bukti_transfer VARCHAR(255),
    status saving_status DEFAULT 'pending',
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pinjaman (
    id SERIAL PRIMARY KEY,
    kode_pinjaman VARCHAR(20) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    anggota_id INT REFERENCES anggota(id) ON DELETE SET NULL,
    jumlah_pinjaman DECIMAL(15, 2) NOT NULL,
    bunga_persen DECIMAL(5, 2) DEFAULT 0.00,
    total_pinjaman DECIMAL(15, 2) NOT NULL,
    tenor_bulan INT NOT NULL,
    angsuran_perbulan DECIMAL(15, 2) NOT NULL,
    sisa_pinjaman DECIMAL(15, 2) NOT NULL,
    tanggal_pinjaman TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tanggal_jatuh_tempo DATE,
    status loan_status DEFAULT 'pending',
    keterangan TEXT,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS angsuran_pinjaman (
    id SERIAL PRIMARY KEY,
    pinjaman_id INT REFERENCES pinjaman(id) ON DELETE CASCADE,
    angsuran_ke INT NOT NULL,
    jumlah_angsuran DECIMAL(15, 2) NOT NULL,
    tanggal_angsuran TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tanggal_jatuh_tempo DATE,
    status installment_status DEFAULT 'belum_bayar',
    denda DECIMAL(15, 2) DEFAULT 0.00,
    keterangan TEXT,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saldo_koperasi (
    id SERIAL PRIMARY KEY,
    periode DATE NOT NULL,
    saldo_awal DECIMAL(15, 2) DEFAULT 0.00,
    pemasukan DECIMAL(15, 2) DEFAULT 0.00,
    pengeluaran DECIMAL(15, 2) DEFAULT 0.00,
    saldo_akhir DECIMAL(15, 2) DEFAULT 0.00,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bagi_hasil_anggota (
    id SERIAL PRIMARY KEY,
    anggota_id INT REFERENCES anggota(id) ON DELETE CASCADE,
    periode DATE NOT NULL,
    jumlah_bagi_hasil DECIMAL(15, 2) DEFAULT 0.00,
    status bagi_hasil_status DEFAULT 'pending',
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE VIEW view_penjualan_per_kategori AS
SELECT
    p.kategori,
    COUNT(td.id) AS total_transaksi,
    SUM(td.jumlah) AS total_qty,
    SUM(td.subtotal) AS total_penjualan
FROM products p
LEFT JOIN transaction_details td ON p.id = td.product_id
GROUP BY p.kategori;

CREATE OR REPLACE VIEW view_total_simpanan AS
SELECT
    u.id AS user_id,
    u.nama_lengkap,
    COALESCE(SUM(CASE WHEN s.jenis_simpanan = 'pokok' AND s.status = 'approved' THEN s.jumlah ELSE 0 END), 0) AS total_pokok,
    COALESCE(SUM(CASE WHEN s.jenis_simpanan = 'wajib' AND s.status = 'approved' THEN s.jumlah ELSE 0 END), 0) AS total_wajib,
    COALESCE(SUM(CASE WHEN s.jenis_simpanan = 'sukarela' AND s.status = 'approved' THEN s.jumlah ELSE 0 END), 0) AS total_sukarela,
    COALESCE(SUM(CASE WHEN s.status = 'approved' THEN s.jumlah ELSE 0 END), 0) AS total_semua_simpanan
FROM users u
LEFT JOIN simpanan s ON u.id = s.user_id
WHERE u.role IN ('admin', 'superadmin')
GROUP BY u.id, u.nama_lengkap;
