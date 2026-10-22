USE sikandang;
DELIMITER // 

DROP PROCEDURE IF EXISTS sp_catatan_harian// 
CREATE PROCEDURE sp_catatan_harian(
  IN p_kandang VARCHAR(50),
  IN p_id_pakan INT,
  IN p_jumlah_pakan_kg DECIMAL(10, 2),
  IN p_jumlah_telur INT,
  IN p_berat_telur_kg DECIMAL(10,2),
  IN p_tanggal DATE
)
