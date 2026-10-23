<?php
require_once __DIR__ . '/src/config/config.php';
require_once __DIR__ . '/src/core/Database.php';

try {
    $hasil = Database::all('SELECT id_pakan, nama_pakan, stok_kg FROM pakan ORDER BY id_pakan');
    echo json_encode($hasil, JSON_PRETTY_PRINT) . PHP_EOL;
} catch (PDOException $e) {
    echo 'GAGAL: ' . $e->getMessage() . PHP_EOL;
}

/**btw ini cuma buat ngetest ya... si php nyambung gk ke database kalo mau dihapus bilang dulu ya.. soalnyba biasany gw ngecek dulu dia nyambung apa kgk **/