<?php

class RiwayatStokController
{
    private RiwayatStokRepository $repo;

    public function __construct()
    {
        $this->repo = new RiwayatStokRepository();
    }

    public function index(): void
    {
        Response::success($this->repo->all());
    }
}