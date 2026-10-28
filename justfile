db_user := "sikandang"
db_name := "sikandang"

php  := env_var_or_default("PHP", "php")
port := env_var_or_default("PORT", "8000")

default:
    @just --list

db-schema:
    mariadb -u {{db_user}} -p {{db_name}} < backend/db/01_schema.sql

db-seed:
    mariadb -u {{db_user}} -p {{db_name}} < backend/db/02_seed.sql

db-triggers:
    mariadb -u {{db_user}} -p {{db_name}} < backend/db/03_triggers.sql

db-sp:
    mariadb -u {{db_user}} -p {{db_name}} < backend/db/04_sp.sql

db-test:
    mariadb -u {{db_user}} -p {{db_name}} < backend/db/05_test.sql

db-setup: db-schema db-seed db-triggers db-sp

serve:
    {{php}} -S 127.0.0.1:{{port}} -t backend/public backend/public/router.php

api-test:
    curl -i http://localhost:{{port}}/sikandang/api/pakan
