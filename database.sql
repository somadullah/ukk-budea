-- ==========================================
-- APLIKASI PEMINJAMAN ALAT - DATABASE SETUP
-- ==========================================
-- Cara Run di phpMyAdmin:
-- 1. Klik tab 'SQL' di atas menu.
-- 2. Paste seluruh kode di bawah ini.
-- 3. Klik tombol 'Kirim' / 'Go'.

CREATE DATABASE IF NOT EXISTS peminjaman_alat;
USE peminjaman_alat;

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'petugas', 'peminjam') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Kategori
CREATE TABLE IF NOT EXISTS kategori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL
);

-- 3. Tabel Alat
CREATE TABLE IF NOT EXISTS alat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_id INT,
    nama_alat VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    jumlah INT DEFAULT 0,
    FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL
);

-- 4. Tabel Peminjaman
CREATE TABLE IF NOT EXISTS peminjaman (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    alat_id INT,
    tanggal_pinjam DATE NOT NULL,
    tanggal_kembali DATE NOT NULL,
    status ENUM('menunggu', 'dipinjam', 'dikembalikan', 'ditolak') DEFAULT 'menunggu',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alat_id) REFERENCES alat(id) ON DELETE CASCADE
);

-- 5. Tabel Pengembalian
CREATE TABLE IF NOT EXISTS pengembalian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peminjaman_id INT,
    tanggal_dikembalikan DATE NOT NULL,
    denda DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id) ON DELETE CASCADE
);

-- 6. Tabel Log Aktifitas
CREATE TABLE IF NOT EXISTS log_aktifitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    aksi VARCHAR(255) NOT NULL,
    tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Trigger: Otomatis kurangi stok saat disetujui
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_peminjaman_approved
AFTER UPDATE ON peminjaman
FOR EACH ROW
BEGIN
    IF NEW.status = 'dipinjam' AND OLD.status = 'menunggu' THEN
        UPDATE alat SET jumlah = jumlah - 1 WHERE id = NEW.alat_id;
    END IF;
END //
DELIMITER ;

-- 8. Trigger: Otomatis tambah stok saat dikembalikan
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_pengembalian_insert
AFTER INSERT ON pengembalian
FOR EACH ROW
BEGIN
    UPDATE peminjaman SET status = 'dikembalikan' WHERE id = NEW.peminjaman_id;
    UPDATE alat SET jumlah = jumlah + 1 WHERE id = (SELECT alat_id FROM peminjaman WHERE id = NEW.peminjaman_id);
END //
DELIMITER ;

-- 9. Function: Hitung denda telat (Rp5000 / hari)
DELIMITER //
CREATE FUNCTION IF NOT EXISTS hitung_denda(tgl_harus_kembali DATE, tgl_kembali DATE) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE days_late INT;
    DECLARE denda_per_hari DECIMAL(10,2) DEFAULT 5000.00;
    SET days_late = DATEDIFF(tgl_kembali, tgl_harus_kembali);
    IF days_late > 0 THEN
        RETURN days_late * denda_per_hari;
    ELSE
        RETURN 0.00;
    END IF;
END //
DELIMITER ;

-- 10. Data Default - Users
INSERT IGNORE INTO users (id, username, password, role) VALUES 
(1, 'admin', 'admin123', 'admin'),
(2, 'petugas1', 'petugas123', 'petugas'),
(3, 'peminjam1', 'peminjam123', 'peminjam');

-- 11. Data Default - Kategori
INSERT IGNORE INTO kategori (id, nama_kategori) VALUES 
(1, 'Elektronik'),
(2, 'Peralatan Jaringan');

-- 12. Data Default - Alat
INSERT IGNORE INTO alat (id, kategori_id, nama_alat, deskripsi, jumlah) VALUES 
(1, 1, 'Proyektor Epson', 'Proyektor untuk presentasi', 5),
(2, 2, 'Kabel UTP 10m', 'Kabel LAN', 20),
(3, 1, 'Laptop Lenovo Thinkpad', 'Laptop core i5', 3);
