<?php

require_once __DIR__ . '/../src/bootstrap.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');


if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

$prefix = '/sikandang/api';
if (str_starts_with($path, $prefix)) {
    $path = substr($path, strlen($prefix));
}
$path = '/' . trim($path, '/');

$pakanController   = new PakanController();
$catatanController = new CatatanHarianController();
$riwayatController = new RiwayatStokController();

try {
    if ($method === 'GET' && $path === '/pakan') {
        $pakanController->index();
    } elseif ($method === 'GET' && preg_match('#^/pakan/(\d+)$#', $path, $m)) {
        $pakanController->show((int) $m[1]);
    } elseif ($method === 'PUT' && preg_match('#^/pakan/(\d+)$#', $path, $m)) {
        $pakanController->update((int) $m[1]);
    } elseif ($method === 'DELETE' && preg_match('#^/pakan/(\d+)$#', $path, $m)) {
        $pakanController->destroy((int) $m[1]);
    } elseif ($method === 'GET' && $path === '/catatan-harian') {
        $catatanController->index();
    } elseif ($method === 'POST' && $path === '/catatan-harian') {
        $catatanController->store();
    } elseif ($method === 'GET' && $path === '/riwayat-stok') {
        $riwayatController->index();
    } else {
        Response::error('Endpoint tidak ditemukan', 404);
    }
} catch (PDOException $e) {
    error_log('[DB] ' . $e->getMessage());


    if ((string) $e->getCode() === '45000') {
        $msg = $e->errorInfo[2] ?? $e->getMessage();
        Response::error($msg, 422);
        exit;
    }

    // 1451 = foreign key constraint fails
    if ((int) ($e->errorInfo[1] ?? 0) === 1451) {
        Response::error('pakan sudah dipakai di catatan, tidak bisa dihapus', 422);
        exit;
    }

    Response::error('Terjadi kesalahan pada database', 500);
} catch (Throwable $e) {
    error_log('[SERVER] ' . $e->getMessage());
    Response::error('Terjadi kesalahan pada server', 500);
}