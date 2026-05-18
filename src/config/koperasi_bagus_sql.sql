-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 06, 2026 at 02:42 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `koperasi_bagus`
--

-- --------------------------------------------------------

--
-- Table structure for table `angsuran_pinjaman`
--

CREATE TABLE `angsuran_pinjaman` (
  `id` int(11) NOT NULL,
  `pinjaman_id` int(11) NOT NULL,
  `angsuran_ke` int(11) NOT NULL,
  `jumlah_angsuran` decimal(15,2) NOT NULL,
  `tanggal_angsuran` datetime DEFAULT current_timestamp(),
  `tanggal_jatuh_tempo` date DEFAULT NULL,
  `status` enum('belum_bayar','sudah_bayar','terlambat') DEFAULT 'belum_bayar',
  `denda` decimal(15,2) DEFAULT 0.00,
  `keterangan` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `angsuran_pinjaman`
--

INSERT INTO `angsuran_pinjaman` (`id`, `pinjaman_id`, `angsuran_ke`, `jumlah_angsuran`, `tanggal_angsuran`, `tanggal_jatuh_tempo`, `status`, `denda`, `keterangan`, `created_by`, `created_at`) VALUES
(1, 2, 1, 125000.00, '2026-03-27 07:00:00', '2026-04-27', 'sudah_bayar', 0.00, 'tes-1', 1, '2026-03-27 08:51:48'),
(2, 2, 2, 125000.00, '2026-03-27 07:00:00', '2026-05-27', 'sudah_bayar', 0.00, 'tes-2', 1, '2026-03-27 08:51:48'),
(3, 2, 3, 125000.00, '2026-03-27 07:00:00', '2026-06-27', 'sudah_bayar', 0.00, 'tes-3', 1, '2026-03-27 08:51:48'),
(4, 2, 4, 125000.00, '2026-03-27 07:00:00', '2026-07-27', 'sudah_bayar', 0.00, 'tes-4', 1, '2026-03-27 08:51:48'),
(5, 2, 5, 125000.00, '2026-03-27 07:00:00', '2026-08-27', 'sudah_bayar', 0.00, 'tes-5', 1, '2026-03-27 08:51:48'),
(6, 2, 6, 125000.00, '2026-03-27 07:00:00', '2026-09-27', 'sudah_bayar', 0.00, 'tes-6', 1, '2026-03-27 08:51:48'),
(7, 2, 7, 125000.00, '2026-03-27 07:00:00', '2026-10-27', 'sudah_bayar', 0.00, 'tes-7', 1, '2026-03-27 08:51:48'),
(8, 2, 8, 125000.00, '2026-03-27 07:00:00', '2026-11-27', 'sudah_bayar', 0.00, 'tes-8', 1, '2026-03-27 08:51:48'),
(9, 2, 9, 125000.00, '2026-03-27 07:00:00', '2026-12-27', 'sudah_bayar', 0.00, 'tes-9', 1, '2026-03-27 08:51:48'),
(10, 2, 10, 125000.00, '2026-03-27 07:00:00', '2027-01-27', 'sudah_bayar', 0.00, 'tes-10', 1, '2026-03-27 08:51:48'),
(11, 2, 11, 125000.00, '2026-03-27 07:00:00', '2027-02-27', 'sudah_bayar', 0.00, 'tes-11', 1, '2026-03-27 08:51:48'),
(12, 2, 12, 125000.00, '2026-03-27 07:00:00', '2027-03-27', 'sudah_bayar', 0.00, 'tes-12', 1, '2026-03-27 08:51:48'),
(13, 6, 1, 100000.00, '2026-04-06 07:00:00', '2026-05-06', 'sudah_bayar', 0.00, 'sdfgsdfgd', 1, '2026-04-06 12:35:41'),
(14, 6, 2, 100000.00, '2026-04-06 07:00:00', '2026-06-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(15, 6, 3, 100000.00, '2026-04-06 07:00:00', '2026-07-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(16, 6, 4, 100000.00, '2026-04-06 07:00:00', '2026-08-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(17, 6, 5, 100000.00, '2026-04-06 07:00:00', '2026-09-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(18, 6, 6, 100000.00, '2026-04-06 07:00:00', '2026-10-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(19, 6, 7, 100000.00, '2026-04-06 07:00:00', '2026-11-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(20, 6, 8, 100000.00, '2026-04-06 07:00:00', '2026-12-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(21, 6, 9, 100000.00, '2026-04-06 07:00:00', '2027-01-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41'),
(22, 6, 10, 100000.00, '2026-04-06 07:00:00', '2027-02-06', 'sudah_bayar', 0.00, NULL, 1, '2026-04-06 12:35:41');

-- --------------------------------------------------------

--
-- Table structure for table `pinjaman`
--

CREATE TABLE `pinjaman` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `jumlah_pinjaman` decimal(15,2) NOT NULL,
  `bunga_persen` decimal(5,2) DEFAULT 0.00,
  `total_pinjaman` decimal(15,2) NOT NULL,
  `tenor_bulan` int(11) NOT NULL,
  `angsuran_perbulan` decimal(15,2) NOT NULL,
  `sisa_pinjaman` decimal(15,2) NOT NULL,
  `tanggal_pinjaman` datetime DEFAULT current_timestamp(),
  `tanggal_jatuh_tempo` date DEFAULT NULL,
  `status` enum('pending','approved','rejected','lunas') DEFAULT 'pending',
  `keterangan` text DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `kode_pinjaman` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `pinjaman`
--

INSERT INTO `pinjaman` (`id`, `user_id`, `jumlah_pinjaman`, `bunga_persen`, `total_pinjaman`, `tenor_bulan`, `angsuran_perbulan`, `sisa_pinjaman`, `tanggal_pinjaman`, `tanggal_jatuh_tempo`, `status`, `keterangan`, `approved_by`, `approved_at`, `created_at`, `kode_pinjaman`) VALUES
(2, 1, 1500000.00, 0.00, 1500000.00, 12, 125000.00, 0.00, '2026-03-27 08:44:12', NULL, 'lunas', 'oke', 1, '2026-03-27 15:51:48', '2026-03-27 08:44:12', 'PJM-001'),
(3, 1, 2000000.00, 0.00, 2000000.00, 6, 333333.33, 2000000.00, '2026-03-27 11:12:40', NULL, 'rejected', 'Tidak bisa', 1, '2026-03-27 18:21:12', '2026-03-27 11:12:40', 'PJM-002'),
(4, 2, 2000000.00, 0.00, 2000000.00, 12, 166666.67, 2000000.00, '2026-03-27 11:21:51', NULL, 'pending', 'Modal Usaha', NULL, NULL, '2026-03-27 11:21:51', 'PJM-003'),
(5, 6, 2500000.00, 0.00, 2500000.00, 25, 100000.00, 2500000.00, '2026-03-27 11:28:34', NULL, 'pending', 'Pinjaman Bank', NULL, NULL, '2026-03-27 11:28:34', 'PJM-004'),
(6, 1, 1000000.00, 0.00, 1000000.00, 10, 100000.00, 0.00, '2026-04-06 12:34:28', NULL, 'lunas', 'Disetujui', 1, '2026-04-06 19:35:40', '2026-04-06 12:34:28', 'PJM-005');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `kategori` enum('buku','seragam','atk') NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga_beli` decimal(15,2) NOT NULL,
  `harga_jual` decimal(15,2) NOT NULL,
  `stok` int(11) DEFAULT 0,
  `satuan` varchar(20) DEFAULT 'pcs',
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `nama_produk`, `kategori`, `deskripsi`, `harga_beli`, `harga_jual`, `stok`, `satuan`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Buku Tulis 38 Lembar', 'buku', 'Buku tulis ukuran sedang', 3000.00, 5000.00, 100, 'pcs', 1, NULL, '2026-01-29 09:50:03', '2026-01-29 09:50:03'),
(2, 'Buku Gambar A4', 'buku', 'Buku gambar ukuran A4', 5000.00, 8000.00, 46, 'pcs', 1, NULL, '2026-01-29 09:50:03', '2026-02-12 00:41:46'),
(3, 'Seragam SD Putih', 'seragam', 'Seragam SD warna putih', 50000.00, 75000.00, 30, 'pcs', 1, NULL, '2026-01-29 09:50:03', '2026-01-29 09:50:03'),
(4, 'Seragam SD Merah', 'seragam', 'Seragam SD warna merah', 50000.00, 75000.00, 30, 'pcs', 1, NULL, '2026-01-29 09:50:03', '2026-01-29 09:50:03'),
(5, 'Pensil 2B', 'atk', 'Pensil 2B standar', 1500.00, 3000.00, 200, 'pcs', 1, NULL, '2026-01-29 09:50:03', '2026-01-29 09:50:03'),
(6, 'Penghapus Putih', 'atk', 'Penghapus karet putih', 1000.00, 2000.00, 150, 'pcs', 1, NULL, '2026-01-29 09:50:03', '2026-01-29 09:50:03'),
(7, 'Pulpen Biru', 'atk', 'Pulpen tinta biru', 2000.00, 3500.00, 100, 'pcs', 1, NULL, '2026-01-29 09:50:03', '2026-01-29 09:50:03'),
(9, 'Buku Gambar A4', 'buku', 'Buku gambar ukuran A4', 5000.00, 8000.00, 43, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-04-06 11:44:03'),
(10, 'Seragam SD Putih', 'seragam', 'Seragam SD warna putih', 50000.00, 75000.00, 26, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-02-12 00:38:04'),
(11, 'Seragam SD Merah', 'seragam', 'Seragam SD warna merah', 50000.00, 75000.00, 30, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-02-08 13:08:34'),
(12, 'Seragam SMP Biru', 'seragam', 'Seragam SMP warna biru', 60000.00, 90000.00, 18, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-04-28 12:31:09'),
(13, 'Pensil 2B', 'atk', 'Pensil 2B standar', 1500.00, 3000.00, 197, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-04-22 07:59:04'),
(14, 'Penghapus Putih', 'atk', 'Penghapus karet putih', 1000.00, 2000.00, 150, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-02-08 13:08:34'),
(15, 'Pulpen Biru', 'atk', 'Pulpen tinta biru', 2000.00, 3500.00, 97, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-04-22 07:59:04'),
(16, 'Penggaris 30cm', 'atk', 'Penggaris plastik 30cm', 2500.00, 4000.00, 78, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-02-12 00:40:40'),
(17, 'Spidol Hitam', 'atk', 'Spidol permanent hitam', 3000.00, 5000.00, 119, 'pcs', 1, 1, '2026-02-08 13:08:34', '2026-02-12 00:41:46'),
(20, 'seragam olahraga', 'seragam', 'seragam lahraga', 50000.00, 60000.00, 97, 'set', 1, 1, '2026-04-06 11:40:56', '2026-05-06 06:17:16');

-- --------------------------------------------------------

--
-- Table structure for table `simpanan`
--

CREATE TABLE `simpanan` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `jenis_simpanan` enum('pokok','wajib','sukarela') NOT NULL,
  `jumlah` decimal(15,2) NOT NULL,
  `tanggal_simpanan` datetime DEFAULT current_timestamp(),
  `keterangan` text DEFAULT NULL,
  `bukti_transfer` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `simpanan`
--

INSERT INTO `simpanan` (`id`, `user_id`, `jenis_simpanan`, `jumlah`, `tanggal_simpanan`, `keterangan`, `bukti_transfer`, `status`, `approved_by`, `approved_at`, `created_at`) VALUES
(1, 1, 'wajib', 200000.00, '2026-03-27 14:24:33', 'simpanan wajib', NULL, 'pending', NULL, NULL, '2026-03-27 07:24:33'),
(2, 2, 'pokok', 150000.00, '2026-03-27 14:25:11', 'simpanan pokok', NULL, 'pending', NULL, NULL, '2026-03-27 07:25:11'),
(3, 6, 'sukarela', 1000000.00, '2026-04-06 19:02:27', 'ooooo ', NULL, 'pending', NULL, NULL, '2026-04-06 12:02:27'),
(4, 6, 'pokok', 400000.00, '2026-04-06 19:04:34', 'ooookkkk', NULL, 'pending', NULL, NULL, '2026-04-06 12:04:34');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `kode_transaksi` varchar(50) NOT NULL,
  `tanggal_transaksi` datetime DEFAULT current_timestamp(),
  `total_harga` decimal(15,2) NOT NULL,
  `total_bayar` decimal(15,2) NOT NULL,
  `kembalian` decimal(15,2) DEFAULT 0.00,
  `metode_pembayaran` enum('tunai','transfer') DEFAULT 'tunai',
  `catatan` text DEFAULT NULL,
  `kasir_id` int(11) DEFAULT NULL,
  `nama_pelanggan` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `kode_transaksi`, `tanggal_transaksi`, `total_harga`, `total_bayar`, `kembalian`, `metode_pembayaran`, `catatan`, `kasir_id`, `nama_pelanggan`, `created_at`) VALUES
(1, 'TRX-001', '2026-02-11 15:48:33', 24000.00, 100000.00, 76000.00, 'tunai', NULL, 1, 'Umum', '2026-02-11 08:48:33'),
(2, 'TRX-002', '2026-02-11 15:49:18', 15000.00, 20000.00, 5000.00, 'tunai', NULL, 1, 'Umum', '2026-02-11 08:49:18'),
(3, 'TRX-003', '2026-02-11 15:49:57', 10000.00, 10000.00, 0.00, 'tunai', NULL, 1, 'Umum', '2026-02-11 08:49:57'),
(4, 'TRX-004', '2026-02-11 15:50:26', 10000.00, 10000.00, 0.00, 'tunai', NULL, 2, 'Umum', '2026-02-11 08:50:26'),
(5, 'TRX-005', '2026-02-11 15:53:40', 5000.01, 100000.00, 0.00, 'tunai', NULL, 2, 'Umum', '2026-02-11 08:53:40'),
(6, 'TRX-006', '2026-02-11 15:54:58', 5000.01, 20000.00, 0.00, 'tunai', NULL, 2, 'Umum', '2026-02-11 08:54:58'),
(7, 'TRX-007', '2026-02-12 06:47:31', 90000.00, 150000.00, 0.00, 'tunai', NULL, 1, 'Umum', '2026-02-11 23:47:31'),
(8, 'TRX-008', '2026-02-12 07:37:24', 83000.00, 100000.00, 17000.00, 'tunai', NULL, 1, 'Umum', '2026-02-12 00:37:24'),
(9, 'TRX-009', '2026-02-12 07:37:47', 83000.00, 100000.00, 17000.00, 'tunai', NULL, 1, 'Umum', '2026-02-12 00:37:47'),
(10, 'TRX-010', '2026-02-12 07:38:04', 83000.00, 100000.00, 17000.00, 'tunai', NULL, 1, 'Umum', '2026-02-12 00:38:04'),
(11, 'TRX-011', '2026-02-12 07:39:59', 7500.00, 10000.00, 2500.00, 'tunai', NULL, 1, 'Umum', '2026-02-12 00:39:59'),
(12, 'TRX-012', '2026-02-12 07:40:40', 7500.00, 10000.00, 2500.00, 'tunai', NULL, 1, 'Umum', '2026-02-12 00:40:40'),
(13, 'TRX-013', '2026-02-12 07:41:46', 13000.00, 15000.00, 2000.00, 'tunai', NULL, 1, 'Umum', '2026-02-12 00:41:46'),
(14, 'TRX-014', '2026-02-12 07:44:42', 93000.00, 100000.00, 7000.00, 'tunai', NULL, 1, 'Test Customer', '2026-02-12 00:44:42'),
(15, 'TRX-015', '2026-03-27 14:23:29', 270000.00, 300000.00, 30000.00, 'tunai', NULL, 1, 'Budi 01', '2026-03-27 07:23:29'),
(16, 'TRX-016', '2026-04-06 18:42:24', 60000.00, 70000.00, 10000.00, 'tunai', NULL, 1, 'budi', '2026-04-06 11:42:24'),
(17, 'TRX-017', '2026-04-06 18:44:03', 24000.00, 25000.00, 1000.00, 'tunai', NULL, 1, 'agus', '2026-04-06 11:44:03'),
(18, 'TRX-018', '2026-04-22 14:59:04', 96500.00, 100000.00, 3500.00, 'tunai', NULL, 1, 'Umum', '2026-04-22 07:59:04'),
(19, 'TRX-019', '2026-04-28 19:31:09', 150000.00, 200000.00, 50000.00, 'tunai', NULL, 1, 'Umum', '2026-04-28 12:31:09'),
(20, 'TRX-020', '2026-05-06 13:17:16', 60000.00, 90000.00, 30000.00, 'tunai', NULL, 1, 'maul', '2026-05-06 06:17:16');

-- --------------------------------------------------------

--
-- Table structure for table `transaction_details`
--

CREATE TABLE `transaction_details` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `nama_produk` varchar(100) NOT NULL,
  `harga_satuan` decimal(15,2) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `subtotal` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `transaction_details`
--

INSERT INTO `transaction_details` (`id`, `transaction_id`, `product_id`, `nama_produk`, `harga_satuan`, `jumlah`, `subtotal`, `created_at`) VALUES
(1, 15, 12, 'Seragam SMP Biru', 90000.00, 3, 270000.00, '2026-03-27 07:23:29'),
(2, 16, 20, 'seragam olahraga', 60000.00, 1, 60000.00, '2026-04-06 11:42:24'),
(3, 17, 9, 'Buku Gambar A4', 8000.00, 3, 24000.00, '2026-04-06 11:44:03'),
(4, 18, 13, 'Pensil 2B', 3000.00, 1, 3000.00, '2026-04-22 07:59:04'),
(5, 18, 12, 'Seragam SMP Biru', 90000.00, 1, 90000.00, '2026-04-22 07:59:04'),
(6, 18, 15, 'Pulpen Biru', 3500.00, 1, 3500.00, '2026-04-22 07:59:04'),
(7, 19, 20, 'seragam olahraga', 60000.00, 1, 60000.00, '2026-04-28 12:31:09'),
(8, 19, 12, 'Seragam SMP Biru', 90000.00, 1, 90000.00, '2026-04-28 12:31:09'),
(9, 20, 20, 'seragam olahraga', 60000.00, 1, 60000.00, '2026-05-06 06:17:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `alamat` text DEFAULT NULL,
  `no_telepon` varchar(20) DEFAULT NULL,
  `role` enum('superadmin','admin','pengunjung') DEFAULT 'pengunjung',
  `foto_profil` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `nama_lengkap`, `alamat`, `no_telepon`, `role`, `foto_profil`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'superadmin', 'superadmin@bagus.com', '$2b$10$.0J5TPWSPQKh8vTJXXav2.uXACLGr6n993tr90dpkNhtPVyOulPXu', 'Ketua Koperasi BAGUS', 'Depok', '0895355386098', 'superadmin', NULL, 1, '2026-01-29 09:50:03', '2026-02-08 22:25:16'),
(2, 'admin1', 'admin1@bagus.com', '$2b$10$FqylQIdEJ6k8MhzYJGZv0.E8aTj9pMonYRQsi5qRWHR1gkF.obR1C', 'Admin Koperasi', 'Jl. Koperasi No. 1', '08123456789', 'admin', NULL, 1, '2026-01-29 09:50:03', '2026-03-27 07:20:46'),
(3, 'pengunjung', 'pengunjung@bagus.com', '$2b$10$yjNrWmmt0TK2tBdVQPtWvuPWsmm5BEV2n2MaAHDdFQFl7JgTFmV1S', 'Pengunjung Test', '', '', 'pengunjung', NULL, 1, '2026-01-29 09:50:03', '2026-04-06 11:37:11'),
(6, 'Admin 2', 'admin2@gmail.com', '$2b$10$8EUZpbkac8CTpoMi1ZPGP.lEW0zw7znqFeQDmVOQNZov53RRlSZbS', 'Admin Koperasi 2', 'Jl. Koperasi Bagus', '08123456789', 'admin', NULL, 1, '2026-03-27 11:27:45', '2026-03-27 11:27:45');

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_penjualan_per_kategori`
-- (See below for the actual view)
--
CREATE TABLE `view_penjualan_per_kategori` (
`kategori` enum('buku','seragam','atk')
,`total_transaksi` bigint(21)
,`total_qty` decimal(32,0)
,`total_penjualan` decimal(37,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_total_simpanan`
-- (See below for the actual view)
--
CREATE TABLE `view_total_simpanan` (
`user_id` int(11)
,`nama_lengkap` varchar(100)
,`total_pokok` decimal(37,2)
,`total_wajib` decimal(37,2)
,`total_sukarela` decimal(37,2)
,`total_semua_simpanan` decimal(37,2)
);

-- --------------------------------------------------------

--
-- Structure for view `view_penjualan_per_kategori`
--
DROP TABLE IF EXISTS `view_penjualan_per_kategori`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_penjualan_per_kategori`  AS SELECT `p`.`kategori` AS `kategori`, count(`td`.`id`) AS `total_transaksi`, sum(`td`.`jumlah`) AS `total_qty`, sum(`td`.`subtotal`) AS `total_penjualan` FROM (`products` `p` join `transaction_details` `td` on(`p`.`id` = `td`.`product_id`)) GROUP BY `p`.`kategori` ;

-- --------------------------------------------------------

--
-- Structure for view `view_total_simpanan`
--
DROP TABLE IF EXISTS `view_total_simpanan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_total_simpanan`  AS SELECT `u`.`id` AS `user_id`, `u`.`nama_lengkap` AS `nama_lengkap`, coalesce(sum(case when `s`.`jenis_simpanan` = 'pokok' and `s`.`status` = 'approved' then `s`.`jumlah` else 0 end),0) AS `total_pokok`, coalesce(sum(case when `s`.`jenis_simpanan` = 'wajib' and `s`.`status` = 'approved' then `s`.`jumlah` else 0 end),0) AS `total_wajib`, coalesce(sum(case when `s`.`jenis_simpanan` = 'sukarela' and `s`.`status` = 'approved' then `s`.`jumlah` else 0 end),0) AS `total_sukarela`, coalesce(sum(case when `s`.`status` = 'approved' then `s`.`jumlah` else 0 end),0) AS `total_semua_simpanan` FROM (`users` `u` left join `simpanan` `s` on(`u`.`id` = `s`.`user_id`)) WHERE `u`.`role` in ('admin','superadmin') GROUP BY `u`.`id`, `u`.`nama_lengkap` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `angsuran_pinjaman`
--
ALTER TABLE `angsuran_pinjaman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pinjaman_id` (`pinjaman_id`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `pinjaman`
--
ALTER TABLE `pinjaman`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_pinjaman` (`kode_pinjaman`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_pinjaman_user` (`user_id`),
  ADD KEY `idx_pinjaman_status` (`status`),
  ADD KEY `idx_kode_pinjaman` (`kode_pinjaman`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_products_kategori` (`kategori`);

--
-- Indexes for table `simpanan`
--
ALTER TABLE `simpanan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_simpanan_user` (`user_id`),
  ADD KEY `idx_simpanan_jenis` (`jenis_simpanan`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_transaksi` (`kode_transaksi`),
  ADD KEY `kasir_id` (`kasir_id`),
  ADD KEY `idx_transactions_tanggal` (`tanggal_transaksi`);

--
-- Indexes for table `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `angsuran_pinjaman`
--
ALTER TABLE `angsuran_pinjaman`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `pinjaman`
--
ALTER TABLE `pinjaman`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `simpanan`
--
ALTER TABLE `simpanan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `transaction_details`
--
ALTER TABLE `transaction_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `angsuran_pinjaman`
--
ALTER TABLE `angsuran_pinjaman`
  ADD CONSTRAINT `angsuran_pinjaman_ibfk_1` FOREIGN KEY (`pinjaman_id`) REFERENCES `pinjaman` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `angsuran_pinjaman_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pinjaman`
--
ALTER TABLE `pinjaman`
  ADD CONSTRAINT `pinjaman_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pinjaman_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `simpanan`
--
ALTER TABLE `simpanan`
  ADD CONSTRAINT `simpanan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `simpanan_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`kasir_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD CONSTRAINT `transaction_details_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaction_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
