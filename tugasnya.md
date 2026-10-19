# Pembagian Tugas

| Role | Orang |
|------|-------|
| Frontend (full) | Awalis |
| Backend | Tamam |
| Database | Jawed |

---

## Awalis — Frontend

- [ ] Buat struktur folder `/client` (HTML/CSS/JS sesuai kebutuhan tugas)
- [ ] Buat halaman utama (landing page)
- [ ] Buat halaman form (tambah/edit data)
- [ ] Buat tampilan daftar data (tabel/list)
- [ ] Styling responsive (minimal tampilan rapi di mobile & desktop)
- [ ] Integrasi fetch ke API backend (`/api/...`) — **setelah kontrak API disepakati**
- [ ] Handle state loading, error, dan data kosong
- [ ] Validasi input di sisi client (sebagai lapis pertama)

## Tamam — Backend

- [ ] Setup project di folder `/server` (pilih stack: Express / Laravel / dsb)
- [ ] Buat endpoint sesuai kontrak API (`docs/api.md`)
- [ ] Buat CRUD (Create, Read, Update, Delete) untuk semua resource
- [ ] Input validation & sanitization di server
- [ ] Handle error response yang konsisten (format JSON error)
- [ ] Setup CORS supaya frontend bisa akses
- [ ] Isi `.env.example` (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `PORT`)
- [ ] Testing endpoint (minimal pakai Postman/curl) + dokumentasikan hasilnya

## Jawed — Database

- [ ] Buat ERD / skema tabel
- [ ] Tulis file `docs/schema.sql` (CREATE TABLE + relasi)
- [ ] Tentukan primary key, foreign key, dan constraint (NOT NULL, UNIQUE, dll)
- [ ] Buat seed data dummy buat keperluan development frontend & backend
- [ ] Setup database lokal + bantu Tim Backend nyambung ke database
- [ ] Backup/restore database (kalau diperlukan tugasnya)

---

## Bersama (semua orang)

- [ ] Sepakati **kontrak API** dulu di `docs/api.md` (endpoint, bentuk request/response)
- [ ] Commit & push rutin ke repo ini (jangan numpuk di akhir)
- [ ] Review bagian masing-masing sebelum deadline
