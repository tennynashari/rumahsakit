-- Migration script to update Room enum values
-- This script cleans up old room data before applying new schema

-- Delete all existing rooms and occupancies
TRUNCATE TABLE "room_occupancies" CASCADE;
TRUNCATE TABLE "rooms" CASCADE;

-- The schema migration can now proceed
