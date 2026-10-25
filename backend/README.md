# Backend SiKandang (PHP Native)

## Deskripsi

Backend SiKandang ini dibuat untuk mengelola data pakan dan catatan harian pada peternakan ayam skala kecil. Project ini dibangun menggunakan PHP murni tanpa framework, dengan tujuan untuk memahami alur kerja backend seperti routing, pemisahan logika, koneksi database, hingga penggunaan trigger dan stored procedure di MariaDB.

## Teknologi yang Digunakan

- **PHP 8.2** - Bahasa pemrograman utama
- **PDO (PHP Data Objects)** - Untuk koneksi dan eksekusi query ke database
- **MariaDB** - Sistem manajemen database
- **PHP Built-in Server** - Untuk menjalankan server secara lokal

## Struktur Folder

```text
backend/
├── .env                # Konfigurasi koneksi database
├── public/             # Entry point aplikasi
│   ├── index.php       # Routing utama API
│   └── router.php      # Router pendukung PHP Built-in Server
├── src/                # Kode inti aplikasi
│   ├── bootstrap.php   # Memuat semua file yang dibutuhkan
│   ├── config/         # Konfigurasi aplikasi
│   │   └── config.php  # Fungsi untuk membaca file .env
│   ├── core/           # Class inti
│   │   ├── Database.php# Koneksi & helper query PDO
│   │   └── Response.php# Helper untuk mengatur format response JSON
│   ├── controller/     # Pengatur alur request & response
│   │   └── PakanController.php
│   └── repository/     # Pengelola query ke database
│       └── PakanRepository.php
├── db/                 # File SQL untuk setup database
│   ├── 01_schema.sql   # Struktur tabel
│   ├── 02_seed.sql     # Data awal
│   ├── 03_triggers.sql # Trigger untuk validasi & mutasi stok
│   ├── 04_sp.sql       # Stored Procedure untuk catatan harian
│   └── 05_test.sql     # Percobaan/testing database
├── api-contract/       # Dokumentasi endpoint (Bruno/OpenCollection)
└── tesDb.php           # Script untuk tes koneksi database
```

## Arsitektur

Backend ini menerapkan pola pemisahan logika yang menyerupai **MVC (Model-View-Controller)**, meski tanpa View karena hanya menghasilkan response berbentuk JSON.

Alurnya sebagai berikut:

1. **Request** - Client mengirim request ke `http://localhost:8000/sikandang/api/...`
2. **Router** - `public/router.php` akan meneruskan request ke `public/index.php`
3. **Bootstrap** - `src/bootstrap.php` memuat semua file inti seperti config, database, controller, dan repository
4. **Routing** - `public/index.php` memotong prefix `/sikandang/api/` lalu mencocokkan method & path yang sesuai
5. **Controller** - `PakanController` mengatur logic dari request yang masuk dan menentukan response yang dikirim
6. **Repository** - `PakanRepository` menjalankan query ke database melalui class `Database`
7. **Database** - `core/Database.php` menggunakan PDO dengan prepared statement, mode `ERRMODE_EXCEPTION`, dan fetch mode `FETCH_ASSOC`
8. **Response** - `core/Response.php` mengembalikan response dengan format JSON yang konsisten lalu dihentikan dengan `exit`

## Database

Database yang digunakan bernama `sikandang` dengan 4 tabel utama:

| Tabel | Fungsi |
| --- | --- |
| `pakan` | Data master pakan beserta jumlah stok (`stok_kg`) saat ini |
| `pemberian_pakan` | Catatan pemberian pakan per kandang |
| `panen_telur` | Catatan hasil panen telur yang berkaitan dengan pemberian pakan |
| `log_stok_pakan` | Riwayat perubahan stok pakan (sebelum & sesudah pemberian) |

Relasi antar tabel:
- `pemberian_pakan.id_pakan` berelasi ke `pakan.id_pakan`
- `panen_telur.id_beri` berelasi ke `pemberian_pakan.id_beri` dengan hubungan **1:1** (karena `UNIQUE`)

### Trigger

Ada 2 trigger yang bekerja secara otomatis saat terjadi `INSERT` pada tabel `pemberian_pakan`:

| Trigger | Waktu | Fungsi |
| --- | --- | --- |
| `trg_cek_pakan` | `BEFORE INSERT` | Memastikan stok pakan cukup. Jika stok tidak ditemukan atau jumlah yang diminta lebih besar dari stok, trigger akan mengeluarkan error dengan `SQLSTATE '45000'`. |
| `trg_mutasi_pakan` | `AFTER INSERT` | Mengurangi stok pakan, lalu mencatat mutasi ke tabel `log_stok_pakan` berisi `stok_sebelum`, `stok_sesudah`, dan keterangan pemberian. |

### Stored Procedure

`sp_catatan_harian` digunakan untuk mencatat pemberian pakan dan hasil panen telur secara bersamaan dalam **satu transaksi atomik**.

Fungsinya adalah:
- Menjalankan `INSERT` ke `pemberian_pakan`
- Mengambil `id_beri` hasil insert dengan `LAST_INSERT_ID()`
- Menjalankan `INSERT` ke `panen_telur` berdasarkan `id_beri` tersebut
- Jika terjadi error, transaksi akan di-`ROLLBACK` sehingga kedua data tidak tercatat sama sekali

**Kenapa wajib dipakai?** Karena kedua tabel harus tetap konsisten. Kalau hanya menggunakan `INSERT` terpisah dari PHP, bisa saja pemberian tercatat tapi panen gagal (atau sebaliknya). Dengan `sp_catatan_harian`, keduanya berhasil semua atau gagal semua.

## Konfigurasi

Konfigurasi database diatur melalui file `.env` yang berada di folder `backend/`.

Variabel yang digunakan:

| Variabel | Keterangan | Contoh |
| --- | --- | --- |
| `DB_HOST` | Host database | `127.0.0.1` |
| `DB_USER` | Username database | `sikandang` |
| `DB_PASS` | Password database | `sikandang123` |
| `DB_NAME` | Nama database | `sikandang` |
| `PORT` | Port server PHP Built-in | `8000` |

File `.env` dibaca oleh `src/config/config.php` menggunakan fungsi `loadEnv()`. Jika `.env` tidak ada, akan digunakan nilai default.

## Instalasi & Menjalankan

### 1. Clone Repository
```bash
git clone git@github.com:jaweed3/uts-web-dasar.git
cd uts-web-dasar
```

### 2. Buat User Database
Perintah ini hanya perlu dijalankan sekali. Butuh akses `sudo`.
```bash
sudo /opt/lampp/bin/mysql -e "CREATE USER IF NOT EXISTS 'sikandang'@'localhost' IDENTIFIED BY 'sikandang123'; GRANT ALL PRIVILEGES ON sikandang.* TO 'sikandang'@'localhost'; FLUSH PRIVILEGES;"
```

### 3. Import Database
Jalankan file SQL secara berurutan:
```bash
/opt/lampp/bin/mysql -u root < backend/db/01_schema.sql
/opt/lampp/bin/mysql -u root < backend/db/02_seed.sql
/opt/lampp/bin/mysql -u root < backend/db/03_triggers.sql
/opt/lampp/bin/mysql -u root < backend/db/04_sp.sql
```

### 4. Atur Konfigurasi .env
Buat atau edit `backend/.env` sesuai dengan konfigurasi di atas.

### 5. Tes Koneksi Database
```bash
/opt/lampp/bin/php backend/tesDb.php
```

### 6. Jalankan Server
Pastikan MariaDB/XAMPP sudah berjalan, lalu jalankan:
```bash
/opt/lampp/bin/php -S 0.0.0.0:8000 -t backend/public backend/public/router.php
```

Server akan berjalan di `http://localhost:8000`

## Daftar Endpoint

| Method | Endpoint | Deskripsi | Status Response |
| --- | --- | --- | --- |
| `GET` | `/sikandang/api/pakan` | Menampilkan seluruh data pakan beserta stok saat ini | `200 OK` |
| `GET` | `/sikandang/api/pakan/{id}` | Menampilkan detail pakan berdasarkan `id_pakan` | `200 OK` / `404 Not Found` |

## Contoh Penggunaan

### Menampilkan semua pakan
```bash
curl -X GET http://localhost:8000/sikandang/api/pakan
```

### Menampilkan detail pakan berdasarkan ID
```bash
curl -X GET http://localhost:8000/sikandang/api/pakan/1
```

### Menampilkan pakan yang tidak ditemukan
```bash
curl -X GET http://localhost:8000/sikandang/api/pakan/999
```

## Cara Testing

1. **Tes koneksi PHP ke database**
   ```bash
   /opt/lampp/bin/php backend/tesDb.php
   ```

2. **Tes endpoint dengan curl**
   Gunakan terminal lain saat server sedang berjalan untuk menguji endpoint di atas.

3. **Tes logika database**
   Bisa langsung menggunakan file `backend/db/05_test.sql` untuk melihat cara kerja trigger dan stored procedure secara manual di MariaDB.

## Catatan

- **Tanpa Framework** - Seluruh proses routing, konfigurasi, dan pemisahan logic dibuat secara manual.
- **Prefix API** - Semua endpoint menggunakan prefix `/sikandang/api/` agar lebih terstruktur.
- **Format JSON Konsisten** - Semua response memakai format `{ "success": true/false, "message": "...", "data": ..., "errors": {...} }` melalui class `Response`.
- **Keamanan Query** - Menggunakan **Prepared Statement** pada PDO untuk mencegah SQL Injection.
- **Validasi Otomatis** - Validasi kecukupan stok dan pencatatan mutasi ditangani langsung oleh **Database Trigger**, bukan dari PHP.
- **Transaksi Atomik** - Pencatatan gabungan pemberian & panen wajib lewat `sp_catatan_harian` agar data tetap konsisten.
- **File Debug** - `tesDb.php` hanya digunakan untuk testing koneksi, sebaiknya dihapus saat ingin commit ke repository.
