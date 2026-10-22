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

SELECT stok_kg FROM pakan WHERE id_pakan = 1;
SELECT COUNT(*) FROM pemberian_pakan WHERE jumlah_pakan_kg = 999;

-- test 3: procedure catatan harian TvT 
CALL sp_catatan_harian('A1', 1, 5, 120, 7.2, '2026-10-21');

SELECT * FROM pemberian_pakan ORDER BY id_beri DESC LIMIT 1;
SELECT * FROM panen_telur ORDER BY id_panen DESC LIMIT 1;
SELECT stok_kg FROM pakan WHERE id_pakan = 1;

-- test 4: procedure gagal -> rollback !! ;(
CALL sp_catatan_harian('A1', 1, 9999, 120, 7.2, '2026-10-21');

SELECT COUNT(*) FROM panen_telur;

-- test 5: kode create catatan harian
SELECT pp.id_beri, pp.KANDANG, pp.jumlah_pakan_kg, pp.tanggal,
  pt.jumlah_telur, pt.berat_telur_kg, p.nama_pakan
FROM pemberian_pakan pp
JOIN panen_telur pt ON pt.id_beri = pp.id_beri
JOIN pakan p ON p.id_pakan = pp.id_pakan
ORDER BY pp.id_beri DESC;
