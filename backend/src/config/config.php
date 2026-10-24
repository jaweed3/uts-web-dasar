<?php

function loadEnv(string $path): array
{
    $env = [];

    if (!is_file($path)) {
        return $env;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $baris) {
        $baris = trim($baris);

        if ($baris === '' || str_starts_with($baris, '#')) {
            continue;
        }

        $pecah = explode('=', $baris, 2);
        if (count($pecah) !== 2) {
            continue;
        }

        $env[trim($pecah[0])] = trim($pecah[1], " \t\n\r\0\x0B\"'");
    }

    return $env;
}

function config(): array
{
    static $cache = null;

    if ($cache === null) {
    $cache = loadEnv(dirname(__DIR__, 2) . '/.env');

        $cache['DB_HOST'] = $cache['DB_HOST'] ?? '127.0.0.1';
        $cache['DB_USER'] = $cache['DB_USER'] ?? 'sikandang';
        $cache['DB_PASS'] = $cache['DB_PASS'] ?? 'sikandang123';
        $cache['DB_NAME'] = $cache['DB_NAME'] ?? 'sikandang';
        $cache['PORT']    = $cache['PORT']    ?? '8000';
    }

    return $cache;
}