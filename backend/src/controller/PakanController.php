<?php

class PakanController
{
    private PakanRepository $repo;

    public function __construct()
    {
        $this->repo = new PakanRepository();
    }


    public function index(): void
    {
        Response::success($this->repo->all());
    }


    public function show(int $id): void
    {
        $pakan = $this->repo->find($id);

        if ($pakan === null) {
            Response::error('Pakan tidak ditemukan', 404);
        }

        Response::success($pakan);
    }
}