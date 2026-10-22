<?php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');


$respon = [
    'success' => true,
    'message' => '500 web run coy',
    'data'    => [
        'waktu' => date('Y-m-d H:i:s')
    ]
];


echo json_encode($respon);