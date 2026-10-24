<?php

class Validator
{
    private array $data;
    private array $errors = [];

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public static function make(array $data): self
    {
        return new self($data);
    }

    public function required(string $field, string $label): self
    {
        $value = $this->data[$field] ?? null;

        if ($value === null || (is_string($value) && trim($value) === '')) {
            $this->errors[$field] = "$label wajib diisi";
        }

        return $this;
    }

    public function integer(string $field, string $label, ?int $min = null): self
    {
        $value = $this->data[$field] ?? null;

        if ($value === null || $value === '') {
            return $this;
        }

        if (filter_var($value, FILTER_VALIDATE_INT) === false) {
            $this->errors[$field] = "$label harus berupa bilangan bulat";
            return $this;
        }

        if ($min !== null && (int)$value < $min) {
            $this->errors[$field] = "$label minimal $min";
        }

        return $this;
    }

    public function number(string $field, string $label, ?float $min = null): self
    {
        $value = $this->data[$field] ?? null;

        if ($value === null || $value === '') {
            return $this;
        }

        if (!is_numeric($value)) {
            $this->errors[$field] = "$label harus berupa angka";
            return $this;
        }

        if ($min !== null && (float)$value < $min) {
            $this->errors[$field] = "$label minimal $min";
        }

        return $this;
    }

    public function date(string $field, string $label): self
    {
        $value = $this->data[$field] ?? null;

        if ($value === null || $value === '') {
            return $this;
        }

        $date = DateTime::createFromFormat('Y-m-d', (string)$value);

        if (!$date || $date->format('Y-m-d') !== $value) {
            $this->errors[$field] = "$label harus berformat YYYY-MM-DD";
        }

        return $this;
    }

    public function maxLength(string $field, string $label, int $max): self
    {
        $value = $this->data[$field] ?? null;

        if (is_string($value) && mb_strlen($value) > $max) {
            $this->errors[$field] = "$label maksimal $max karakter";
        }

        return $this;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }
}