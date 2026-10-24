<?php

class CatatanHarianRepository
{
    private const SELECT_JOIN = "
        SELECT pp.id_beri,
               pp.KANDANG AS kandang,
               pp.jumlah_pakan_kg,
               pp.tanggal,
               pt.jumlah_telur,
               pt.berat_telur_kg,
               p.id_pakan,
               p.nama_pakan
        FROM pemberian_pakan pp
        JOIN panen_telur pt ON pt.id_beri = pp.id_beri
        JOIN pakan p ON p.id_pakan = pp.id_pakan
    ";


    public function all(): array
    {
        return Database::all(self::SELECT_JOIN . ' ORDER BY pp.id_beri DESC');
    }


    public function create(array $data): ?array
    {

        Database::run(
            'CALL sp_catatan_harian(:kandang, :id_pakan, :jumlah_pakan_kg, :jumlah_telur, :berat_telur_kg, :tanggal)',
            [
                ':kandang'         => $data['kandang'],
                ':id_pakan'        => $data['id_pakan'],
                ':jumlah_pakan_kg' => $data['jumlah_pakan_kg'],
                ':jumlah_telur'    => $data['jumlah_telur'],
                ':berat_telur_kg'  => $data['berat_telur_kg'],
                ':tanggal'         => $data['tanggal'],
            ]
        );


        return Database::one(
            self::SELECT_JOIN . '
             WHERE pp.kandang = :kandang
               AND pp.id_pakan = :id_pakan
               AND pp.tanggal  = :tanggal
             ORDER BY pp.id_beri DESC
             LIMIT 1',
            [
                ':kandang'  => $data['kandang'],
                ':id_pakan' => $data['id_pakan'],
                ':tanggal'  => $data['tanggal'],
            ]
        );
    }
}