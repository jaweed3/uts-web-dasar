# SiKandang API — Bruno OpenCollection

Collection minimal untuk UTS project SiKandang.

## Import ke Bruno

1. Di Bruno, pilih **Open Collection** dan pilih folder `sikandang-bruno-opencollection`.
2. Pilih environment **Local**.
3. Sesuaikan `baseUrl` di `environments/local.yml` dengan alamat backend PHP kalian.

## Endpoints

- `GET /pakan`
- `GET /pakan/:id`
- `GET /catatan-harian`
- `POST /catatan-harian`

## Catatan

- Ini adalah contract awal; endpoint harus disesuaikan jika route PHP kalian berbeda.
- `POST /catatan-harian` diasumsikan mengembalikan HTTP `201` ketika sukses.
- Request POST mencatat pemberian pakan dan panen telur dalam satu transaksi.
