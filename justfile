# Database configuration
host := "127.0.0.1"
user := "sikandang"
database := "sikandang"

# Shared MySQL command
mysql := "mysql -h " + host + " -u " + user + " -p " + database

# Database tasks
db-schema:
    {{mysql}} < backend/db/01_schema.sql

db-seed:
    {{mysql}} < backend/db/02_seed.sql

db-triggers:
    {{mysql}} < backend/db/03_triggers.sql

db-sp:
    {{mysql}} < backend/db/04_sp.sql

db-test:
    {{mysql}} < backend/db/05_test.sql

# Show available tasks
default:
    @just --list
