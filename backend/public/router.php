<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$fileLokal = __DIR__ . $uri;
if ($uri !== '/' && file_exists($fileLokal)) {
    return false; 
}

require_once __DIR__ . '/index.php';