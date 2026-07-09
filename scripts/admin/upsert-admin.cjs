#!/usr/bin/env node
'use strict';

/**
 * Xennic Admin Upsert / Recovery Script
 *
 * Purpose:
 *   - Create an admin user if it does not exist.
 *   - Reset admin password if it already exists.
 *   - Ensure the user is active, not deleted, and marked as admin.
 *   - Ensure default workspace membership.
 *   - Ensure SUPER_ADMIN role assignment.
 *
 * Usage:
 *   ADMIN_EMAIL='admin@xennic.ir' ADMIN_PASSWORD='StrongPass123!' node scripts/admin/upsert-admin.cjs
 *
 * Optional:
 *   ADMIN_FIRST_NAME='Admin'
 *   ADMIN_LAST_NAME='Xennic'
 *   ADMIN_WORKSPACE_CODE='XENNIC'
 *   ADMIN_WORKSPACE_NAME='Xennic'
 */

const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const { randomUUID } = require('node:crypto');

const db = new PrismaClient();

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function assertNoMarkdown(value, fieldName) {
  const text = String(value || '');
  if (text.includes('[') || text.includes('](') || text.includes('mailto:')) {
    throw new Error(
      `${fieldName} looks like a copied Markdown link. Use plain text only. Example: admin@xennic.ir`,
    );
  }
}

function assertPassword(value) {
  if (!value) {
    throw new Error('ADMIN_PASSWORD is required');
  }

  if (value.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  if (value.length > 128) {
    throw new Error('ADMIN_PASSWORD must not exceed 128 characters');
  }
}

async function ensureRole(slug, name) {
  const now = new Date();

  return db.roles.upsert({
    where: { slug },
    update: {
      name,
      updated_at: now,
    },
    create: {
      id: randomUUID(),
      slug,
      name,
      created_at: now,
      updated_at: now,
    },
  });
}

async function ensureWorkspace({ code, name, userId }) {
  const now = new Date();

  const existing = await db.workspaces.findUnique({
    where: { code },
  });

  if (!existing) {
    return db.workspaces.create({
      data: {
        id: randomUUID(),
        code,
        name,
        created_by: userId,
        updated_by: userId,
        created_at: now,
        updated_at: now,
      },
    });
  }

  if (existing.deleted_at) {
    return db.workspaces.update({
      where: { id: existing.id },
      data: {
        deleted_at: null,
        updated_by: userId,
        updated_at: now,
      },
    });
  }

  return db.workspaces.update({
    where: { id: existing.id },
    data: {
      name,
      updated_by: userId,
      updated_at: now,
    },
  });
}

async function ensureWorkspaceMembership({ workspaceId, userId }) {
  const now = new Date();

  return db.workspace_members.upsert({
    where: {
      workspace_id_user_id: {
        workspace_id: workspaceId,
        user_id: userId,
      },
    },
    update: {
      role: 'OWNER',
    },
    create: {
      id: randomUUID(),
      workspace_id: workspaceId,
      user_id: userId,
      role: 'OWNER',
      joined_at: now,
    },
  });
}

async function ensureUserRole({ userId, roleId, workspaceId }) {
  return db.user_roles.upsert({
    where: {
      user_id_role_id_workspace_id: {
        user_id: userId,
        role_id: roleId,
        workspace_id: workspaceId,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      user_id: userId,
      role_id: roleId,
      workspace_id: workspaceId,
    },
  });
}

async function main() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@xennic.ir');
  const password = process.env.ADMIN_PASSWORD || '';
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'Xennic';
  const workspaceCode = process.env.ADMIN_WORKSPACE_CODE || 'XENNIC';
  const workspaceName = process.env.ADMIN_WORKSPACE_NAME || 'Xennic';

  assertNoMarkdown(email, 'ADMIN_EMAIL');
  assertPassword(password);

  const now = new Date();

  const hash = await argon2.hash(password, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const user = await db.users.upsert({
    where: { email },
    update: {
      password: hash,
      first_name: firstName,
      last_name: lastName,
      is_admin: true,
      is_active: true,
      email_verified_at: now,
      deleted_at: null,
      updated_at: now,
    },
    create: {
      id: randomUUID(),
      email,
      password: hash,
      first_name: firstName,
      last_name: lastName,
      is_admin: true,
      is_active: true,
      email_verified_at: now,
      created_at: now,
      updated_at: now,
    },
  });

  const workspace = await ensureWorkspace({
    code: workspaceCode,
    name: workspaceName,
    userId: user.id,
  });

  const superAdminRole = await ensureRole('SUPER_ADMIN', 'Super Admin');

  await ensureWorkspaceMembership({
    workspaceId: workspace.id,
    userId: user.id,
  });

  await ensureUserRole({
    userId: user.id,
    roleId: superAdminRole.id,
    workspaceId: workspace.id,
  });

  const updatedUser = await db.users.findUnique({
    where: { email },
  });

  const passwordVerified = await argon2.verify(updatedUser.password, password);

  console.log('');
  console.log('✅ Xennic admin user is ready');
  console.log('────────────────────────────────────────');
  console.log(`Email:              ${updatedUser.email}`);
  console.log(`User ID:            ${updatedUser.id}`);
  console.log(`Is admin:           ${updatedUser.is_admin}`);
  console.log(`Is active:          ${updatedUser.is_active}`);
  console.log(`Deleted at:         ${updatedUser.deleted_at}`);
  console.log(`Email verified at:  ${updatedUser.email_verified_at}`);
  console.log(`Password verified:  ${passwordVerified}`);
  console.log(`Workspace:          ${workspace.name} (${workspace.code})`);
  console.log(`Role:               ${superAdminRole.slug}`);
  console.log('────────────────────────────────────────');
  console.log('');

  if (!passwordVerified) {
    throw new Error('Password verification failed after update');
  }
}

main()
  .catch((err) => {
    console.error('');
    console.error('❌ Admin upsert failed');
    console.error(err.message || err);
    console.error('');
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
