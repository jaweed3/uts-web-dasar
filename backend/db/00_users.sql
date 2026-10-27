CREATE DATABASE IF NOT EXISTS sikandang;

CREATE USER IF NOT EXIST 'sikandang'@'%' IDENTIFIED BY 'sikandang123';
CREATE USER IF NOT EXIST 'sikandang'@'localhost' IDENTIFIED BY 'sikandang123';

GRANT ALL PRIVILEGES ON sikandang.* TO 'sikandang'@'%';
GRANT ALL PRIVILEGES ON sikandang.* TO 'sikandang'@'localhost';

FLUSH PRIVILEGES;

