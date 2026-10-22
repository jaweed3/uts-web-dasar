<?php

class PakanRepository
{

    public function all(): array
    {
        return Database::all(
            'SELECT id_pakan, nama_pakan, stok_kg FROM pakan ORDER BY id_pakan'
        );
    }

    public function find(int $id): ?array
    {
        return Database::one(
            'SELECT id_pakan, nama_pakan, stok_kg FROM pakan WHERE id_pakan = ?',
            [$id]
        );
    }
}