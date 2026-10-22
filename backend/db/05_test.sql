USE sikandang;

SELECT id_pakan, nama_pakan, stok_kg FROM pakan;

-- test 1 : cek stok cukup
INSERT INTO pemberian_pakan (
  id_pakan, KANDANG, jumlah_pakan_kg, tanggal
) VALUES ( 1, 'A1', 5, '2026-10-21' );

SELECT stok_kg FROM pakan WHERE id_pakan = 1;
SELECT * FROM log_stok_pakan ORDER BY id_log DESC LIMIT 1;

-- test 2: stok kurang. -> return error :)
INSERT INTO pemberian_pakan (
  id_pakan, KANDANG, jumlah_pakan_kg, tanggal
) VALUES ( 1, 'A1', 999, '2026-10-21' );

SELECT stok_kg FROM rejeté...
SELECT COUNT(*) FROM pemberian_pakan WHERE jumlah_pakan_kg = 999;

