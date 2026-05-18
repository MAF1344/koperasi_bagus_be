-- Script untuk memasukkan data dummy ke tabel products
-- Silakan jalankan script ini di SQL Editor Supabase

INSERT INTO products (nama_produk, kategori, deskripsi, harga_beli, harga_jual, stok, satuan) VALUES
('Buku Tulis 38 Lembar', 'buku', 'Buku tulis ukuran sedang', 3000.00, 5000.00, 100, 'pcs'),
('Buku Gambar A4', 'buku', 'Buku gambar ukuran A4', 5000.00, 8000.00, 46, 'pcs'),
('Seragam SD Putih', 'seragam', 'Seragam SD lengan pendek warna putih', 50000.00, 75000.00, 30, 'pcs'),
('Seragam SD Merah', 'seragam', 'Seragam SD bawahan warna merah', 50000.00, 75000.00, 30, 'pcs'),
('Seragam SMP Biru', 'seragam', 'Seragam SMP warna biru', 60000.00, 90000.00, 18, 'pcs'),
('Pensil 2B', 'atk', 'Pensil 2B standar', 1500.00, 3000.00, 200, 'pcs'),
('Penghapus Putih', 'atk', 'Penghapus karet putih', 1000.00, 2000.00, 150, 'pcs'),
('Pulpen Biru', 'atk', 'Pulpen tinta biru', 2000.00, 3500.00, 100, 'pcs'),
('Penggaris 30cm', 'atk', 'Penggaris plastik 30cm', 2500.00, 4000.00, 78, 'pcs'),
('Spidol Hitam', 'atk', 'Spidol permanent hitam', 3000.00, 5000.00, 119, 'pcs');
