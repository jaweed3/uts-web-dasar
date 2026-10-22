<?php

class Database
{
    private static ?PDO $pdo = null;

    public static function conn(): PDO
    {
        if (self::$pdo === null) {
            $cfg = config();

            $dsn = "mysql:host={$cfg['DB_HOST']};dbname={$cfg['DB_NAME']};charset=utf8mb4";

            self::$pdo = new PDO($dsn, $cfg['DB_USER'], $cfg['DB_PASS'], [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        }

        return self::$pdo;
    }


    public static function all(string $sql, array $params = []): array
    {
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }


    public static function one(string $sql, array $params = []): ?array
    {
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);

        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }


    public static function run(string $sql, array $params = []): int
    {
        $stmt = self::conn()->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount();
    }
}