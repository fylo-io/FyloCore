-- Initialize PostgreSQL with required extensions for FyloCore
-- This script runs automatically when the container starts for the first time

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector similarity search (for embeddings)
-- Note: pgvector extension may need to be added to the Docker image
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create a function to run arbitrary SQL (similar to Supabase's rpc function)
CREATE OR REPLACE FUNCTION run_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant permissions to the fylocore user
GRANT ALL PRIVILEGES ON DATABASE fylocore TO fylocore;
GRANT ALL ON SCHEMA public TO fylocore;
