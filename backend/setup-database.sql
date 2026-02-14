-- SQL Script to setup database and user
-- Run this in pgAdmin or psql as postgres superuser

-- Drop existing database and user (if exists)
DROP DATABASE IF EXISTS rumahsakit;
DROP USER IF EXISTS rumahsakit;

-- Create user
CREATE USER rumahsakit WITH PASSWORD 'rumahsakit123';

-- Create database
CREATE DATABASE rumahsakit OWNER rumahsakit;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rumahsakit TO rumahsakit;

-- Connect to rumahsakit database and grant schema privileges
\c rumahsakit
GRANT ALL ON SCHEMA public TO rumahsakit;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rumahsakit;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rumahsakit;
