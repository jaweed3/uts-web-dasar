<?php

class Router
{
    private static array $routes = [];

    public static function get(string $path, array $handler): void
    {
        self::add('GET', $path, $handler);
    }

    public static function post(string $path, array $handler): void
    {
        self::add('POST', $path, $handler);
    }

    private static function add(string $method, string $path, array $handler): void
    {
        $regex = preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $path);

        self::$routes[] = [
            'method'  => $method,
            'pattern' => '#^' . $regex . '$#',
            'handler' => $handler,
        ];
    }

    public static function dispatch(Request $request): void
    {
        if ($request->method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $pathMatched = false;

        foreach (self::$routes as $route) {
            if (!preg_match($route['pattern'], $request->path(), $match)) {
                continue;
            }

            $pathMatched = true;

            if ($route['method'] !== $request->method()) {
                continue;
            }

            $params = [];
            foreach ($match as $key => $value) {
                if (!is_int($key)) {
                    $params[$key] = $value;
                }
            }

            [$class, $method] = $route['handler'];

            try {
                (new $class())->$method($request, $params);
            } catch (PDOException $e) {
                $code = $e->getCode();

                if ((string) $code === '45000') {
                    $msg = $e->errorInfo[2] ?? $e->getMessage();
                    Response::error($msg, 422);
                }

                Response::error('Terjadi kesalahan pada database', 500);
            } catch (Throwable $e) {
                Response::error('Terjadi kesalahan pada server', 500);
            }

            return;
        }

        if ($pathMatched) {
            Response::error('Metode tidak diizinkan untuk endpoint ini', 405);
        }

        Response::error('Endpoint tidak ditemukan', 404);
    }
}