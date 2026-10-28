<?php

class CatatanHarianController
{
    private CatatanHarianRepository $repo;

    private PakanRepository $pakanRepo;

    public function __construct()
    {
        $this->repo = new CatatanHarianRepository;
        $this->pakanRepo = new PakanRepository;
    }

    public function index(): void
    {
        $data = $this->repo->all();
        Response::success($data);
    }

    public function store(): void
    {
        $raw = file_get_contents('php://input');
        $body = [];

        if ($raw !== false && trim($raw) !== '') {
            $json = json_decode($raw, true);
            if (is_array($json)) {
                $body = $json;
            }
        }

        $validator = Validator::make($body)
            ->required('kandang', 'Kandang')
            ->maxLength('kandang', 'Kandang', 50)
            ->required('id_pakan', 'Pakan')
            ->integer('id_pakan', 'Pakan', 1)
            ->required('jumlah_pakan_kg', 'Jumlah pakan')
            ->number('jumlah_pakan_kg', 'Jumlah pakan', 0.01)
            ->required('jumlah_telur', 'Jumlah telur')
            ->integer('jumlah_telur', 'Jumlah telur', 0)
            ->required('berat_telur_kg', 'Berat telur')
            ->number('berat_telur_kg', 'Berat telur', 0)
            ->required('tanggal', 'Tanggal')
            ->date('tanggal', 'Tanggal');

        if ($validator->fails()) {
            Response::error('Validasi gagal', 400, $validator->errors());

            return;
        }

        $idPakan = (int) $body['id_pakan'];

        $cekPakan = $this->pakanRepo->find($idPakan);
        if ($cekPakan === null) {
            Response::error('Pakan tidak ditemukan', 404);

            return;
        }

        // Siapin data
        $data = [
            'kandang' => trim((string) $body['kandang']),
            'id_pakan' => $idPakan,
            'jumlah_pakan_kg' => (float) $body['jumlah_pakan_kg'],
            'jumlah_telur' => (int) $body['jumlah_telur'],
            'berat_telur_kg' => (float) $body['berat_telur_kg'],
            'tanggal' => (string) $body['tanggal'],
        ];

        $hasil = $this->repo->create($data);

        Response::success($hasil, 'Catatan harian berhasil disimpan', 201);
    }
}
