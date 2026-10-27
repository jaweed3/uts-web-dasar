<?php

class PakanController
{
    private PakanRepository $repo;

    public function __construct()
    {
        $this->repo = new PakanRepository();
    }

    public function index(): void
    {
        Response::success($this->repo->all());
    }

    public function show(int $id): void
    {
        $pakan = $this->repo->find($id);

        if ($pakan === null) {
            Response::error('Pakan tidak ditemukan', 404);
        }

        Response::success($pakan);
    }

    // Tugas 3: PUT /pakan/{id}
    public function update(int $id): void
    {
        if ($this->repo->find($id) === null) {
            Response::error('Pakan tidak ditemukan', 404);
            return;
        }

        $raw  = file_get_contents('php://input');
        $body = json_decode((string) $raw, true);

        if (!is_array($body)) {
            $body = [];
        }

        $namaPakan = null;

        if (array_key_exists('nama_pakan', $body)) {
            $namaPakan = trim((string) $body['nama_pakan']);

            if ($namaPakan === '') {
                Response::error('Validasi gagal', 400, ['nama_pakan' => 'Nama pakan tidak boleh kosong']);
                return;
            }

            if (mb_strlen($namaPakan) > 100) {
                Response::error('Validasi gagal', 400, ['nama_pakan' => 'Nama pakan maksimal 100 karakter']);
                return;
            }
        }

        $tambahStok = null;

        if (array_key_exists('stok_kg', $body)) {
            if (!is_numeric($body['stok_kg'])) {
                Response::error('Validasi gagal', 400, ['stok_kg' => 'Stok harus berupa angka']);
                return;
            }

            $tambahStok = (float) $body['stok_kg'];

            if ($tambahStok <= 0) {
                Response::error('Validasi gagal', 400, ['stok_kg' => 'Penambahan stok harus lebih dari 0']);
                return;
            }
        }

        if ($namaPakan === null && $tambahStok === null) {
            Response::error('Tidak ada data yang diubah', 400);
            return;
        }

        $this->repo->update($id, $namaPakan, $tambahStok);

        Response::success($this->repo->find($id), 'Data pakan berhasil diperbarui');
    }

    // Tugas 4: DELETE /pakan/{id}
    public function destroy(int $id): void
    {
        if ($this->repo->find($id) === null) {
            Response::error('Pakan tidak ditemukan', 404);
            return;
        }

        try {
            $this->repo->delete($id);
        } catch (PDOException $e) {
            // 1451 = foreign key constraint fails
            if ((int) ($e->errorInfo[1] ?? 0) === 1451) {
                Response::error('pakan sudah dipakai di catatan, tidak bisa dihapus', 422);
                return;
            }

            throw $e;
        }

        Response::success(null, 'Pakan berhasil dihapus');
    }
}