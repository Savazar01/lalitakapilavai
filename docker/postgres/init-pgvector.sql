-- PostgreSQL Initialization Script for Lalita Kapilavai Portfolio & Archive
-- Enables pgvector and uuid extensions for multi-modal vector search and unique identifiers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Verification notice
DO $$
BEGIN
   RAISE NOTICE 'Extensions uuid-ossp and vector successfully initialized.';
END
$$;
