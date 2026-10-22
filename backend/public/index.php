<?php

require_once __DIR__ . '/../src/bootstrap.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

$prefix = '/sikandang/api/v1';
if (str_starts_with($path, $prefix)) {
    $path = substr($path, strlen($prefix));
}
$path = '/' . trim($path, '/');


$controller = new PakanController();

try {
    if ($method === 'GET' && $path === '/pakan') {
        $controller->index();
    } elseif ($method === 'GET' && preg_match('#^/pakan/(\d+)$#', $path, $m)) {
        $controller->show((int) $m[1]);
    } else {
        Response::error('not found', 404);
    }
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan pada database', 500);
} catch (Throwable $e) {
    Response::error('Terjadi kesalahan pada server', 500);
}