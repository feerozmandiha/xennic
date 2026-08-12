/**
 * Database Integration Tests — project_files table
 *
 * XENNIC-STORAGE-EO-1B-TESTS-012 Section 9
 * Runs against a real PostgreSQL database in CI or local development.
 * The runner must apply committed migrations first; this suite creates only
 * isolated data fixtures and never changes the schema.
 *
 * Uses @prisma/client directly to avoid ESM issues with @xennic/database
 */
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const testUserId = `test-user-${randomUUID()}`;
const testWorkspaceId = `test-workspace-${randomUUID()}`;
const testWorkspaceCode = `test-ws-${randomUUID()}`;
const testProjectId = `test-project-${randomUUID()}`;
const testFileId = `test-file-${randomUUID()}`;

async function sql(query: string): Promise<any[]> {
  return (prisma as any).$queryRawUnsafe(query);
}

async function exec(query: string): Promise<number> {
  return (prisma as any).$executeRawUnsafe(query);
}

beforeAll(async () => {
  await exec(
    `INSERT INTO users
      (id, email, password, first_name, last_name, is_admin, is_active, created_at, updated_at)
     VALUES
      ('${testUserId}', '${testUserId}@test.local', 'test-hash', 'E2E', 'ProjectFile', false, true, NOW(), NOW())`,
  );
  await exec(
    `INSERT INTO workspaces
      (id, code, name, created_by, created_at, updated_at)
     VALUES
      ('${testWorkspaceId}', '${testWorkspaceCode}', 'Project File E2E Workspace', '${testUserId}', NOW(), NOW())`,
  );
  await exec(
    `INSERT INTO projects
      (id, workspace_id, name, status, created_by, created_at, updated_at)
     VALUES
      ('${testProjectId}', '${testWorkspaceId}', 'Project File E2E Project', 'active', '${testUserId}', NOW(), NOW())`,
  );
  await exec(
    `INSERT INTO files
      (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
     VALUES
      ('${testFileId}', '${testWorkspaceId}', 'documents', 'e2e/${testFileId}.pdf', '${testFileId}.pdf', 'project-file.pdf', '.pdf', 'application/pdf', 1, '${testUserId}', NOW())`,
  );
});

afterAll(async () => {
  await exec(`DELETE FROM project_files WHERE project_id = '${testProjectId}'`).catch(() => {});
  await exec(`DELETE FROM files WHERE id = '${testFileId}'`).catch(() => {});
  await exec(`DELETE FROM projects WHERE id = '${testProjectId}'`).catch(() => {});
  await exec(`DELETE FROM workspaces WHERE id = '${testWorkspaceId}'`).catch(() => {});
  await exec(`DELETE FROM users WHERE id = '${testUserId}'`).catch(() => {});
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
  it('should insert a project_file row', async () => {
    const id = `test-${randomUUID()}`;
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
    const id1 = `test-${randomUUID()}`;
    const id2 = `test-${randomUUID()}`;

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
    const id = `test-${randomUUID()}`;
    await expect(
      exec(
        `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
         VALUES ('${id}', '00000000-0000-0000-0000-000000000000', '${testFileId}', '${testUserId}', NOW())`,
      ),
    ).rejects.toThrow();
  });

  it('should reject insert with non-existent file_id (FK violation)', async () => {
    const id = `test-${randomUUID()}`;
    await expect(
      exec(
        `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
         VALUES ('${id}', '${testProjectId}', '00000000-0000-0000-0000-000000000000', '${testUserId}', NOW())`,
      ),
    ).rejects.toThrow();
  });

  it('should reject insert with non-existent added_by (FK violation)', async () => {
    const id = `test-${randomUUID()}`;
    await expect(
      exec(
        `INSERT INTO project_files (id, project_id, file_id, added_by, created_at)
         VALUES ('${id}', '${testProjectId}', '${testFileId}', '00000000-0000-0000-0000-000000000000', NOW())`,
      ),
    ).rejects.toThrow();
  });

  it('should delete a project_file row', async () => {
    const id = `test-${randomUUID()}`;
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
    const rows = await sql(
      `SELECT * FROM project_files
       WHERE project_id = '${testProjectId}'
       ORDER BY created_at DESC
       LIMIT 10 OFFSET 0`,
    );
    expect(Array.isArray(rows)).toBe(true);
  });

  it('should count by project_id', async () => {
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
