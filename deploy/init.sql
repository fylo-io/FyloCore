-- Initialize PostgreSQL database for FyloCore
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create the uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional: Create additional extensions that might be useful
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
-- CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For better indexing

-- Log that initialization is complete
DO $$
BEGIN
  RAISE NOTICE 'FyloCore PostgreSQL database initialized successfully with uuid-ossp extension';
END $$;
