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

    public function update(int $id, ?string $namaPakan, ?float $tambahStok): void
    {
        Database::run(
            'UPDATE pakan
             SET nama_pakan = COALESCE(?, nama_pakan),
                 stok_kg    = stok_kg + ?
             WHERE id_pakan = ?',
            [$namaPakan, $tambahStok ?? 0, $id]
        );
    }


    public function delete(int $id): int
    {
        return Database::run(
            'DELETE FROM pakan WHERE id_pakan = ?',
            [$id]
        );
    }
}