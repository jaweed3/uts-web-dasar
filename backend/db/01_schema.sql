CREATE DATABASE IF NOT EXISTS sikandang;
USE sikandang;

-- master pakan
CREATE TABLE pakan (
    id_pakan INT AUTO_INCREMENT PRIMARY KEY,
    nama_pakan VARCHAR(100) NOT NULL,
    stok_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    CHECK (stok_kg >= 0)
);

CREATE TABLE pemberian_pakan (
    id_beri INT AUTO_INCREMENT PRIMARY KEY,
    id_pakan INT NOT NULL,
    KANDANG VARCHAR(50) NOT NULL,
    jumlah_pakan_kg DECIMAL(10,2) NOT NULL,
    tanggal DATE NOT NULL,

    CONSTRAINT fk_pemberian_pakan
        FOREIGN KEY (id_pakan)
        REFERENCES pakan(id_pakan),

    CHECK (jumlah_pakan_kg > 0)
);

CREATE TABLE panen_telur (
    id_panen INT AUTO_INCREMENT PRIMARY KEY,
    id_beri INT NOT NULL UNIQUE,
    jumlah_telur INT NOT NULL,
    berat_telur_kg DECIMAL(10,2) NOT NULL,
    tanggal DATE NOT NULL,

    CONSTRAINT fk_panen_pemberian
        FOREIGN KEY (id_beri)
        REFERENCES pemberian_pakan(id_beri),

    CHECK (jumlah_telur >= 0),
    CHECK (berat_telur_kg >= 0)
);

CREATE TABLE log_stok_pakan (
    id_log BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pakan INT NOT NULL,
    stok_sebelum DECIMAL(10,2) NOT NULL,
    stok_sesudah DECIMAL(10,2) NOT NULL,
    keterangan VARCHAR(255) NOT NULL,
    tanggal TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_pakan
        FOREIGN KEY (id_pakan)
        REFERENCES pakan(id_pakan)
);
