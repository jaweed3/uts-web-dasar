<?php
// 1. Izinkan akses dari luar (CORS) & set format balasan jadi JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// 2. Respon sementara untuk uji coba Hari 1
$respon = [
    'success' => true,
    'message' => '500 web run',
    'data'    => [
        'waktu' => date('Y-m-d H:i:s')
    ]
];

// 3. Cetak ke layar dalam bentuk teks JSON
echo json_encode($respon);