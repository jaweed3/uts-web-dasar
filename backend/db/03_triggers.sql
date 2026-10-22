USE sikandang;

DELIMITER //
CREATE TRIGGER trg_cek_pakan
BEFORE INSERT ON pemberian_pakan FOR EACH ROW
BEGIN
DECLARE v_stok DECIMAL(10, 2);

SELECT
  stok_kg INTO v_stok
FROM
  pakan
where
  id_pakan = NEW.id_pakan;
  
  IF v_stok is null THEN
    signal SQLSTATE '45000' set MESSAGE_TEXT = 'pakan tidak ditemukan';
  ELSEIF NEW.jumlah_pakan_kg > v_stok THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'stok pakan tidak mencukupi';
  END IF;
END// 

CREATE TRIGGER trg_mutasi_pakan
AFTER INSERT on pemberian_pakan FOR EACH ROW
BEGIN
  DECLARE v_sebelum DECIMAL(10, 2);

  SELECT stok_kg INTO v_sebelum FROM pakan WHERE id_pakan = NEW.id_pakan;

  UPDATE pakan SET stok_kg = v_sebelum - NEW.jumlah_pakan_kg
  WHERE id_pakan = NEW.id_pakan;

  INSERT INTO log_stok_pakan (
    id_pakan, stok_sebelum, stok_sesudah, keterangan
  ) VALUES ( NEW.id_pakan, v_sebelum, v_sebelum - NEW.jumlah_pakan_kg,
  CONCAT('Pemberian #', NEW.id_beri, ' - Kandang', NEW.KANDANG));
END//  

CREATE PROCEDURE sp_catatan_harian(
  IN p_kandang VARCHAR(50),
  IN p_id_pakan INT,
  IN p_jumlah_pakan_kg DECIMAL(10,2),
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
    id_pakan, KANDANG, jumlah_pakan_kg, tanggal
  ) VALUES ( p_id_pakan, p_kandang, p_jumlah_pakan_kg, p_tanggal );

  SET v_id_beri = LAST_INSERT_ID();

  INSERT INTO panen_telur (
    id_beri, jumlah_telur, berat_telur_kg, tanggal
  ) VALUES ( v_id_beri, p_jumlah_telur, p_berat_telur_kg, p_tanggal );

  COMMIT;
END// 

DELIMITER ;
