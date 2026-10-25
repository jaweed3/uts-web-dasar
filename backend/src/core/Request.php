<?php

class Request
{
    private string $method;
    private string $path;
    private array $query = [];
    private array $body = [];

    public static function capture(): self
    {
        $request = new self();

        $request->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $request->path   = self::normalizePath($_SERVER['REQUEST_URI'] ?? '/');
        $request->query  = $_GET;
        $request->body   = self::parseJsonBody();

        return $request;
    }

    private static function normalizePath(string $uri): string
    {
        $path   = parse_url($uri, PHP_URL_PATH) ?? '/';
        $prefix = '/sikandang/api';

        if (str_starts_with($path, $prefix)) {
            $path = substr($path, strlen($prefix));
        }

        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }

    private static function parseJsonBody(): array
    {
        $raw = file_get_contents('php://input');

        if ($raw === false || trim($raw) === '') {
            return [];
        }

        $data = json_decode($raw, true);

        return is_array($data) ? $data : [];
    }

    public function method(): string
    {
        return $this->method;
    }

    public function path(): string
    {
        return $this->path;
    }

    public function query(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    public function all(): array
    {
        return $this->body;
    }
}