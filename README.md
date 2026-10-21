# SiKandang

Aplikasi pencatatan pemberian pakan dan panen telur pada peternakan ayam. Menggunakan **MariaDB Triggers** dan **Stored Procedures** untuk menjaga konsistensi stok dan integritas transaksi.

## Features

- Pencatatan stok pakan.
- Pencatatan pemberian pakan per kandang.
- Pencatatan hasil panen telur.
- Validasi stok otomatis menggunakan trigger.
- Pencatatan mutasi stok.
- Transaksi atomik dengan rollback otomatis.

## Tech Stack

- **Frontend:** HTML, Tailwind CSS, Vanilla JavaScript
- **Backend:** PHP
- **Database:** MariaDB

## Database Logic

- `trg_cek_pakan` — validasi kecukupan stok sebelum pemberian.
- `trg_mutasi_pakan` — pengurangan stok dan pencatatan mutasi otomatis.
- `sp_catatan_harian` — mengelola transaksi pemberian pakan dan panen secara atomik.

## Database Tables

- `pakan`
- `pemberian_pakan`
- `panen_telur`
- `log_stok_pakan`

## Getting Started

1. Siapkan database MariaDB.
2. Import skema, trigger, dan stored procedure.
3. Konfigurasikan koneksi database pada backend PHP.
4. Jalankan aplikasi melalui server lokal PHP.

## Testing

- Transaksi valid dengan stok mencukupi.
- Pemberian pakan melebihi stok harus ditolak.
- Kegagalan pencatatan panen harus membatalkan seluruh transaksi.

## Project

Developed for the Database Systems II midterm project at Universitas Darussalam Gontor.
