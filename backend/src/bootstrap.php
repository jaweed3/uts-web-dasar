<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Request.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/repository/PakanRepository.php';
require_once __DIR__ . '/controller/PakanController.php';