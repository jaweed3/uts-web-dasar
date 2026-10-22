USE sikandang;

DELIMITER / /
CREATE TRIGGER trg_cek_pakan
BEFORE INSERT ON pemberian_pakan FOR EACH ROW
BEGIN
DECLARE v_stok DECIMAL(10, 2);

SELECT
  stok_kg INTO v_stok
FROM
  pakan
where
  id_pakan = NEW.id_pakan
FOR UPDATE;

IF v_stok IS NULL THEN END
