# SiKandang

<p align="center">
  <img src="assets/logo.png" alt="SiKandang Logo" width="420">
</p>

<p align="center">
  Aplikasi pencatatan pakan dan panen telur untuk peternakan ayam skala kecil.
</p>

## Features

- Pencatatan stok dan pemberian pakan.
- Pencatatan hasil panen telur.
- Validasi stok otomatis menggunakan database trigger.
- Pencatatan mutasi stok.
- Transaksi atomik menggunakan stored procedure.

## Tech Stack

- **Frontend:** HTML, Tailwind CSS
- **Backend:** PHP
- **Database:** MariaDB

## Database Logic

| Component | Responsibility |
|---|---|
| `trg_cek_pakan` | Memvalidasi kecukupan stok |
| `trg_mutasi_pakan` | Memperbarui stok dan mencatat mutasi |
| `sp_catatan_harian` | Memproses pemberian pakan dan panen secara atomik |

## Database Tables

`pakan` · `pemberian_pakan` · `panen_telur` · `log_stok_pakan`

## Getting Started

1. Siapkan database MariaDB.
2. Import skema, trigger, dan stored procedure dari direktori `sql/`.
3. Konfigurasikan koneksi database di direktori `config/`.
4. Jalankan aplikasi menggunakan server PHP lokal.

## Project

Developed for the Database Systems II midterm project at Universitas Darussalam Gontor.
