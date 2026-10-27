<?php

class RiwayatStokRepository
{
    public function all(): array
    {
        return Database::all(
            'SELECT l.id_log,
                    l.id_pakan,
                    p.nama_pakan,
                    l.stok_sebelum,
                    l.stok_sesudah,
                    l.keterangan,
                    l.tanggal
             FROM log_stok_pakan l
             JOIN pakan p ON p.id_pakan = l.id_pakan
             ORDER BY l.id_log DESC'
        );
    }

    public function byPakan(int $idPakan): array
    {
        return Database::all(
            'SELECT l.id_log,
                    l.id_pakan,
                    p.nama_pakan,
                    l.stok_sebelum,
                    l.stok_sesudah,
                    l.keterangan,
                    l.tanggal
             FROM log_stok_pakan l
             JOIN pakan p ON p.id_pakan = l.id_pakan
             WHERE l.id_pakan = ?
             ORDER BY l.id_log DESC',
            [$idPakan]
        );
    }
}