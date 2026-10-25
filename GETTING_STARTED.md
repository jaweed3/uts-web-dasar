## Getting Started

### Prerequisites

- PHP
- MariaDB
- [just](https://github.com/casey/just)

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:jaweed3/uts-web-dasar.git
   cd uts-web-dasar
   ```

2. Set up the database:

   ```bash
   just db-setup
   ```

   This creates the database and application user, grants the required privileges, and initializes the schema, seed data, triggers, and stored procedures.

3. Start the PHP development server:

   ```bash
   just serve
   ```

4. Test the API in another terminal:

   ```bash
   curl -s http://localhost:8000/sikandang/api/pakan
   ```

### Available Commands

- `just db-setup` — Create and initialize the database.
- `just db-schema` — Create database tables.
- `just db-seed` — Insert initial data.
- `just db-triggers` — Set up database triggers.
- `just db-sp` — Set up stored procedures.
- `just db-test` — Run database tests.
- `just serve` — Start the PHP development server.
