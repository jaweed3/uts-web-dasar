<?php

require_once __DIR__ . '/../src/bootstrap.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

$prefix = '/sikandang/api/v1';
if (str_starts_with($path, $prefix)) {
    $path = substr($path, strlen($prefix));
}
$path = '/' . trim($path, '/');

$pakanController   = new PakanController();
$catatanController = new CatatanHarianController();

try {
    if ($method === 'GET' && $path === '/pakan') {
        $pakanController->index();
    } elseif ($method === 'GET' && preg_match('#^/pakan/(\d+)$#', $path, $m)) {
        $pakanController->show((int) $m[1]);
    } elseif ($method === 'GET' && $path === '/catatan-harian') {
        $catatanController->index();
    } elseif ($method === 'POST' && $path === '/catatan-harian') {
        $catatanController->store();
    } else {
        Response::error('Endpoint tidak ditemukan', 404);
    }
} catch (PDOException $e) {
    if ((string) $e->getCode() === '45000') {
        $msg = $e->errorInfo[2] ?? $e->getMessage();
        Response::error($msg, 422);
        exit;
    }

    Response::error('Terjadi kesalahan pada database', 500);
} catch (Throwable $e) {
    Response::error('Terjadi kesalahan pada server', 500);
}