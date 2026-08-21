-- The preceding calculation baseline was produced by pg_dump and clears the
-- session search_path. Prisma may reuse that session for the next migration,
-- so restore PostgreSQL's default lookup path before unqualified DDL runs.
SET search_path = "$user", public;
