# Backend SiKandang (PHP Native)

Backend API SiKandang untuk pencatatan pakan dan panen telur ayam.
Dibuat dengan PHP murni tanpa framework, memakai PDO dan MariaDB.

## Teknologi

- PHP 8.2
- PDO dengan prepared statement
- MariaDB
- PHP Built-in Server

## Struktur Folder

```text
backend/
├── public/index.php           entry point + routing
├── public/router.php          router untuk php -S
├── src/bootstrap.php          load semua class
├── src/config/config.php      baca file .env
├── src/core/                  Database, Response, Validator
├── src/controller/            Pakan, CatatanHarian, RiwayatStok
├── src/repository/            seluruh query SQL
└── db/                        01_schema sampai 05_test
```

## Konfigurasi

File `.env` ada di folder `backend/`.

```env
DB_HOST=127.0.0.1
DB_USER=sikandang
DB_PASS=sikandang123
DB_NAME=sikandang
PORT=8000
```

Dibaca oleh `src/config/config.php`:

```php
loadEnv(dirname(__DIR__, 2) . '/.env');
```

`.env` masuk `.gitignore`; yang di-commit hanya `.env.example`.

## Setup Database

```bash
/opt/lampp/bin/mysql -u root < backend/db/01_schema.sql
/opt/lampp/bin/mysql -u root < backend/db/02_seed.sql
/opt/lampp/bin/mysql -u root < backend/db/03_triggers.sql
/opt/lampp/bin/mysql -u root < backend/db/04_sp.sql
```

## Menjalankan Server

```bash
/opt/lampp/bin/php -S 0.0.0.0:8000 -t backend/public backend/public/router.php
```

Base URL: `http://localhost:8000/sikandang/api`

## Daftar Endpoint

| Method | Endpoint | Deskripsi | Status |
| --- | --- | --- | --- |
| GET | `/pakan` | semua data pakan | 200 |
| GET | `/pakan/{id}` | detail pakan | 200, 404 |
| PUT | `/pakan/{id}` | ubah nama / tambah stok | 200, 400, 404 |
| DELETE | `/pakan/{id}` | hapus pakan | 200, 404, 422 |
| GET | `/catatan-harian` | semua catatan | 200 |
| POST | `/catatan-harian` | simpan catatan | 201, 400, 404, 422 |
| GET | `/riwayat-stok` | riwayat mutasi stok | 200 |

Body `PUT /pakan/{id}`:

```json
{"nama_pakan":"Bekatul Halus","stok_kg":10}
```

Nilai `stok_kg` adalah jumlah tambahan, jadi stok baru = stok lama + `stok_kg`.

Body `POST /catatan-harian`:

```json
{"kandang":"A1","id_pakan":1,"jumlah_pakan_kg":5,"jumlah_telur":120,"berat_telur_kg":7.2,"tanggal":"2026-10-27"}
```

## Status Code

| Code | Arti |
| --- | --- |
| 200 | berhasil |
| 201 | data berhasil dibuat |
| 204 | preflight OPTIONS |
| 400 | validasi gagal |
| 404 | data atau endpoint tidak ditemukan |
| 422 | stok kurang, atau pakan masih dipakai catatan |
| 500 | error server atau database |

## Logika Database

| Objek | Fungsi |
| --- | --- |
| `trg_cek_pakan` | BEFORE INSERT, cek stok, `SIGNAL SQLSTATE '45000'` kalau stok kurang |
| `trg_mutasi_pakan` | AFTER INSERT, kurangi `stok_kg` dan catat ke `log_stok_pakan` |
| `sp_catatan_harian` | insert pemberian + panen dalam satu transaksi atomik |

`POST /catatan-harian` wajib lewat `CALL sp_catatan_harian(...)`.
PHP tidak pernah menulis `log_stok_pakan` secara manual.
Error `45000` diterjemahkan menjadi 422, error `1451` juga menjadi 422.

Catatan: trigger hanya bereaksi pada `INSERT pemberian_pakan`. Belum ada
trigger `AFTER UPDATE ON pakan`, sehingga penambahan stok lewat
`PUT /pakan/{id}` belum tercatat otomatis di `log_stok_pakan`.

## Hasil Pengujian Endpoint

Diuji dengan `curl` pada `http://localhost:8000/sikandang/api`.

| No | Method | Endpoint | Skenario | Status |
| --- | --- | --- | --- | --- |
| 1 | OPTIONS | `/pakan` | preflight CORS | 204 |
| 2 | GET | `/pakan` | semua data | 200 |
| 3 | GET | `/pakan/1` | data ada | 200 |
| 4 | GET | `/pakan/999` | data tidak ada | 404 |
| 5 | PUT | `/pakan/2` | tambah stok 10 | 200 |
| 6 | PUT | `/pakan/2` | ganti nama | 200 |
| 7 | PUT | `/pakan/2` | body kosong | 400 |
| 8 | PUT | `/pakan/999` | id tidak ada | 404 |
| 9 | POST | `/catatan-harian` | data valid | 201 |
| 10 | GET | `/riwayat-stok` | ambil log stok | 200 |
| 11 | DELETE | `/pakan/1` | pakan dipakai catatan | 422 |
| 12 | DELETE | `/pakan/3` | pakan tidak dipakai | 200 |
| 13 | POST | `/catatan-harian` | stok kurang | 422 |
| 14 | GET | `/ngawur` | endpoint salah | 404 |

## Catatan

- Semua query memakai prepared statement, tidak ada input user yang disambung ke SQL.
- Prefix `/sikandang/api` dipotong di `public/index.php`.
- Routing memakai `if/elseif` di `index.php`, tanpa class Router.
- `tesDb.php` hanya dipakai untuk debug koneksi