-- Grant privileges to rumahsakit user
-- Run this in pgAdmin Query Tool connected to rumahsakit database as postgres user

-- Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE rumahsakit TO rumahsakit;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rumahsakit;
GRANT USAGE ON SCHEMA public TO rumahsakit;
GRANT CREATE ON SCHEMA public TO rumahsakit;

-- Grant table privileges (for existing and future tables)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rumahsakit;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rumahsakit;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO rumahsakit;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rumahsakit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO rumahsakit;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO rumahsakit;
