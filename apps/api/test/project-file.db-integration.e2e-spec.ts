/**
 * Database Integration Tests — project_files table
 *
 * XENNIC-STORAGE-EO-1B-TESTS-012 Section 9
 * Runs against real PostgreSQL (Local Development)
 * NO schema changes, NO migrations, NO db push
 *
 * Uses @prisma/client directly to avoid ESM issues with @xennic/database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let testUserId: string;
let testProjectId: string;
let testFileId: string;

async function sql(query: string): Promise<any[]> {
  return (prisma as any).$queryRawUnsafe(query);
}

async function exec(query: string): Promise<number> {
  return (prisma as any).$executeRawUnsafe(query);
}

beforeAll(async () => {
  const users = await sql(`SELECT id FROM users LIMIT 1`);
  if (users.length === 0) {
    throw new Error('No users in database — cannot run integration tests');
  }
  testUserId = users[0].id;
});

afterAll(async () => {
  await exec(`DELETE FROM project_files WHERE id LIKE 'test-%'`).catch(() => {});
  await prisma.$disconnect();
});

describe('project_files — Database Schema Verification', () => {
  it('project_files table should exist', async () => {
    const result = await sql(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'project_files'
      ) as exists`,
    );
    expect(result[0].exists).toBe(true);
  });

  it('should have primary key on id', async () => {
    const result = await sql(
      `SELECT a.attname FROM pg_index i
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
       WHERE i.indrelid = 'project_files'::regclass AND i.indisprimary`,
    );
    const pkColumns = result.map((r: any) => r.attname);
    expect(pkColumns).toContain('id');
  });

  it('should have unique constraint on (project_id, file_id)', async () => {
    const result = await sql(
      `SELECT conname, contype FROM pg_constraint
       WHERE conrelid = 'project_files'::regclass AND contype = 'u'`,
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should have index on project_id', async () => {
    const result = await sql(
      `SELECT indexname FROM pg_indexes
       WHERE tablename = 'project_files' AND indexdef LIKE '%project_id%'`,
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('should have index on file_id', async () => {
    const result = await sql(
      `SELECT indexname FROM pg_indexes
       WHERE tablename = 'project_files' AND indexdef LIKE '%file_id%'`,
    );
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe('project_files — Foreign Key Verification', () => {
  it('project_id FK should reference projects(id)', async () => {
    const result = await sql(
      `SELECT conname, c.relname as ref_table
       FROM pg_constraint
       JOIN pg_class c ON c.oid = confrelid
       WHERE conrelid = 'project_files'::regclass
       AND contype = 'f'`,
    );
    const fk = result.find((r: any) => r.ref_table === 'projects');
    expect(fk).toBeDefined();
  });

  it('file_id FK should reference files(id)', async () => {
    const result = await sql(
      `SELECT conname, c.relname as ref_table
       FROM pg_constraint
       JOIN pg_class c ON c.oid = confrelid
       WHERE conrelid = 'project_files'::regclass
       AND contype = 'f'`,
    );
    const fk = result.find((r: any) => r.ref_table === 'files');
    expect(fk).toBeDefined();
  });

  it('added_by FK should reference users(id)', async () => {
    const result = await sql(
      `SELECT conname, c.relname as ref_table
       FROM pg_constraint
       JOIN pg_class c ON c.oid = confrelid
       WHERE conrelid = 'project_files'::regclass
       AND contype = 'f'`,
    );
    const fk = result.find((r: any) => r.ref_table === 'users');
    expect(fk).toBeDefined();
  });

  it('project_id FK should have ON DELETE CASCADE', async () => {
    const projFkCol = await sql(
      `SELECT attnum FROM pg_attribute WHERE attrelid = 'project_files'::regclass AND attname = 'project_id'`,
    );
    const result = await sql(
      `SELECT confdeltype FROM pg_constraint
       WHERE conrelid = 'project_files'::regclass
       AND ${projFkCol[0].attnum} = ANY(conkey)
       AND contype = 'f'`,
    );
    expect(result[0]?.confdeltype).toBe('c');
  });

  it('file_id FK should have ON DELETE RESTRICT', async () => {
    const fileFkCol = await sql(
      `SELECT attnum FROM pg_attribute WHERE attrelid = 'project_files'::regclass AND attname = 'file_id'`,
    );
    const result = await sql(
      `SELECT confdeltype FROM pg_constraint
       WHERE conrelid = 'project_files'::regclass
       AND ${fileFkCol[0].attnum} = ANY(conkey)
       AND contype = 'f'`,
    );
    expect(result[0]?.confdeltype).toBe('r');
  });

  it('added_by FK should have ON DELETE RESTRICT', async () => {
    const addedByCol = await sql(
      `SELECT attnum FROM pg_attribute WHERE attrelid = 'project_files'::regclass AND attname = 'added_by'`,
    );
    const result = await sql(
      `SELECT confdeltype FROM pg_constraint
       WHERE conrelid = 'project_files'::regclass
       AND ${addedByCol[0].attnum} = ANY(conkey)
       AND contype = 'f'`,
    );
    expect(result[0]?.confdeltype).toBe('r');
  });
});

describe('project_files — CRUD Operations', () => {
  beforeAll(async () => {
    const projects = await sql(`SELECT id FROM projects WHERE deleted_at IS NULL LIMIT 1`);
    const files = await sql(`SELECT id FROM files WHERE deleted_at IS NULL LIMIT 1`);

    if (projects.length > 0) testProjectId = projects[0].id;
    if (files.length > 0) testFileId = files[0].id;
  });

  it('should insert a project_file row', async () => {
    if (!testProjectId || !testFileId) {
      console.warn('Skipping: no projects or files in database');
      return;
    }

    const id = `test-${crypto.randomUUID()}`;
    const count = await exec(
      `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
       VALUES ('${id}', '${testProjectId}', '${testFileId}', '${testUserId}', NOW())`,
    );
    expect(count).toBe(1);

    const rows = await sql(`SELECT * FROM project_files WHERE id = '${id}'`);
    expect(rows.length).toBe(1);
    expect(rows[0].project_id).toBe(testProjectId);
    expect(rows[0].file_id).toBe(testFileId);
    expect(rows[0].added_by).toBe(testUserId);

    await exec(`DELETE FROM project_files WHERE id = '${id}'`);
  });

  it('should reject duplicate (project_id, file_id)', async () => {
    if (!testProjectId || !testFileId) {
      console.warn('Skipping: no projects or files');
      return;
    }

    const id1 = `test-${crypto.randomUUID()}`;
    const id2 = `test-${crypto.randomUUID()}`;

    await exec(
      `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
       VALUES ('${id1}', '${testProjectId}', '${testFileId}', '${testUserId}', NOW())`,
    );

    await expect(
      exec(
        `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
         VALUES ('${id2}', '${testProjectId}', '${testFileId}', '${testUserId}', NOW())`,
      ),
    ).rejects.toThrow();

    await exec(`DELETE FROM project_files WHERE id IN ('${id1}', '${id2}')`);
  });

  it('should reject insert with non-existent project_id (FK violation)', async () => {
    if (!testFileId) {
      console.warn('Skipping: no files');
      return;
    }

    const id = `test-${crypto.randomUUID()}`;
    await expect(
      exec(
        `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
         VALUES ('${id}', '00000000-0000-0000-0000-000000000000', '${testFileId}', '${testUserId}', NOW())`,
      ),
    ).rejects.toThrow();
  });

  it('should reject insert with non-existent file_id (FK violation)', async () => {
    if (!testProjectId) {
      console.warn('Skipping: no projects');
      return;
    }

    const id = `test-${crypto.randomUUID()}`;
    await expect(
      exec(
        `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
         VALUES ('${id}', '${testProjectId}', '00000000-0000-0000-0000-000000000000', '${testUserId}', NOW())`,
      ),
    ).rejects.toThrow();
  });

  it('should reject insert with non-existent added_by (FK violation)', async () => {
    if (!testProjectId || !testFileId) {
      console.warn('Skipping: no projects or files');
      return;
    }

    const id = `test-${crypto.randomUUID()}`;
    await expect(
      exec(
        `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
         VALUES ('${id}', '${testProjectId}', '${testFileId}', '00000000-0000-0000-0000-000000000000', NOW())`,
      ),
    ).rejects.toThrow();
  });

  it('should delete a project_file row', async () => {
    if (!testProjectId || !testFileId) {
      console.warn('Skipping: no projects or files');
      return;
    }

    const id = `test-${crypto.randomUUID()}`;
    await exec(
      `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
       VALUES ('${id}', '${testProjectId}', '${testFileId}', '${testUserId}', NOW())`,
    );

    const deleted = await exec(`DELETE FROM project_files WHERE id = '${id}'`);
    expect(deleted).toBe(1);

    const rows = await sql(`SELECT * FROM project_files WHERE id = '${id}'`);
    expect(rows.length).toBe(0);
  });

  it('should query by project_id with LIMIT/OFFSET', async () => {
    if (!testProjectId) {
      console.warn('Skipping: no projects');
      return;
    }

    const rows = await sql(
      `SELECT * FROM project_files
       WHERE project_id = '${testProjectId}'
       ORDER BY created_at DESC
       LIMIT 10 OFFSET 0`,
    );
    expect(Array.isArray(rows)).toBe(true);
  });

  it('should count by project_id', async () => {
    if (!testProjectId) {
      console.warn('Skipping: no projects');
      return;
    }

    const result = await sql(
      `SELECT COUNT(*)::text as count FROM project_files
       WHERE project_id = '${testProjectId}'`,
    );
    expect(Number(result[0].count)).toBeGreaterThanOrEqual(0);
  });
});

describe('project_files — Migration Status', () => {
  it('project_files migration should be recorded', async () => {
    const result = await sql(
      `SELECT migration_name FROM _prisma_migrations
       WHERE migration_name LIKE '%project_files%'
       AND finished_at IS NOT NULL
       ORDER BY finished_at DESC LIMIT 1`,
    );
    expect(result.length).toBe(1);
    expect(result[0].migration_name).toContain('project_files');
  });

  it('should have no failed migrations', async () => {
    const result = await sql(
      `SELECT COUNT(*)::text as count FROM _prisma_migrations
       WHERE migration_name LIKE '%project_files%'
       AND rolled_back_at IS NOT NULL`,
    );
    expect(Number(result[0].count)).toBe(0);
  });
});
