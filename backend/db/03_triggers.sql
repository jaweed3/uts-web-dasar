USE sikandang;

DELIMITER //
DROP TRIGGER IF EXISTS trg_cek_pakan//
CREATE TRIGGER trg_cek_pakan
BEFORE INSERT ON pemberian_pakan FOR EACH ROW
BEGIN
DECLARE v_stok DECIMAL(10, 2);

SELECT
  stok_kg INTO v_stok
FROM
  pakan
where
  id_pakan = NEW.id_pakan FOR UPDATE;
  
  IF v_stok is null THEN
    signal SQLSTATE '45000' set MESSAGE_TEXT = 'pakan tidak ditemukan';
  ELSEIF NEW.jumlah_pakan_kg > v_stok THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'stok pakan tidak mencukupi';
  END IF;
END// 

DROP TRIGGER IF EXISTS trg_mutasi_pakan//
CREATE TRIGGER trg_mutasi_pakan
AFTER INSERT on pemberian_pakan FOR EACH ROW
BEGIN
  DECLARE v_sebelum DECIMAL(10, 2);

  SELECT stok_kg INTO v_sebelum FROM pakan WHERE id_pakan = NEW.id_pakan FOR UPDATE;

  UPDATE pakan SET stok_kg = v_sebelum - NEW.jumlah_pakan_kg
  WHERE id_pakan = NEW.id_pakan;

  INSERT INTO log_stok_pakan (
    id_pakan, stok_sebelum, stok_sesudah, keterangan
  ) VALUES ( NEW.id_pakan, v_sebelum, v_sebelum - NEW.jumlah_pakan_kg,
  CONCAT('Pemberian #', NEW.id_beri, ' - Kandang', NEW.KANDANG));
END//  


DELIMITER ;
