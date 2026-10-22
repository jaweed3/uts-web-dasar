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
BEGIN
  DECLARE v_id_beri INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  INSERT INTO pemberian_pakan (
    id_pakan, KANDANG, p_jumlah_pakan_kg, tanggal
  ) VALUES ( p_id_pakan, p_kandang, p_jumlah_pakan_kg, p_tanggal );

  SET v_id_beri = LAST_INSERT_ID();

  INSERT INTO panen_telur (
    id_beri, jumlah_telur, berat_telur_kg, tanggal
  ) VALUES ( v_id_beri, p_jumlah_telur, p_berat_telur_kg, p_tanggal );

  COMMIT;
END// 

DELIMITER ;
