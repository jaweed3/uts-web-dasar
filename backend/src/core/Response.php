<?php
/**
 * Response = membalas request dengan format JSON yang konsisten.
 *
 *   sukses -> { "success": true,  "message": "...", "data": ... }
 *   gagal  -> { "success": false, "message": "...", "errors": {...} }
 */
class Response
{
    /** Balas sukses. */
    public static function success($data, string $message = '', int $status = 200): void
    {
        $payload = ['success' => true];

        if ($message !== '') {
            $payload['message'] = $message;
        }

        $payload['data'] = $data;

        self::send($payload, $status);
    }

    /** Balas gagal. */
    public static function error(string $message, int $status = 400, array $errors = []): void
    {
        $payload = ['success' => false, 'message' => $message];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        self::send($payload, $status);
    }

    /** Kirim JSON lalu hentikan program. */
    private static function send(array $payload, int $status): void
    {
        http_response_code($status);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}