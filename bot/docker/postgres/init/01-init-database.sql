-- Initialize the InvestorManagementSystemDb database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS audit;
-- CREATE SCHEMA IF NOT EXISTS reporting;

-- Set timezone
SET timezone = 'UTC';

-- Create a read-only user for reporting (optional)
-- CREATE USER lemotick_readonly WITH PASSWORD 'readonly_password';
-- GRANT CONNECT ON DATABASE "InvestorManagementSystemDb" TO lemotick_readonly;
-- GRANT USAGE ON SCHEMA public TO lemotick_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO lemotick_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO lemotick_readonly;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL database initialized successfully for LemoTick Investor Management System';
END $$;
