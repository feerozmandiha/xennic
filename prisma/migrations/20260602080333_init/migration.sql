-- ============================================================
-- XENNIC PLATFORM — Full Database Migration v2
-- Date: 2026-06-06
-- Description: Complete schema for all domains
-- ============================================================

-- Drop old Tenant table if exists (from initial migration)
DROP TABLE IF EXISTS "Tenant";

-- ============================================================
-- IDENTITY DOMAIN
-- ============================================================

CREATE TABLE "users" (
  "id"                UUID        NOT NULL DEFAULT gen_random_uuid(),
  "email"             TEXT        NOT NULL,
  "phone"             TEXT        UNIQUE,
  "password"          TEXT        NOT NULL,
  "first_name"        TEXT        NOT NULL,
  "last_name"         TEXT        NOT NULL,
  "avatar_file_id"    UUID,
  "is_active"         BOOLEAN     NOT NULL DEFAULT true,
  "email_verified_at" TIMESTAMPTZ,
  "last_login"        TIMESTAMPTZ,
  "created_by"        TEXT,
  "updated_by"        TEXT,
  "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at"        TIMESTAMPTZ,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key"   ON "users"("email");
CREATE INDEX "idx_users_deleted_at"     ON "users"("deleted_at");
CREATE INDEX "idx_users_created_at"     ON "users"("created_at");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "sessions" (
  "id"               UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          UUID        NOT NULL,
  "ip_address"       TEXT,
  "user_agent"       TEXT,
  "expires_at"       TIMESTAMPTZ NOT NULL,
  "last_activity_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_sessions_user_id"   ON "sessions"("user_id");
CREATE INDEX "idx_sessions_expires_at" ON "sessions"("expires_at");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "refresh_tokens" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    UUID        NOT NULL,
  "token_hash" TEXT        NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE INDEX "idx_refresh_tokens_user_id"            ON "refresh_tokens"("user_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "password_reset_tokens" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    UUID        NOT NULL,
  "token_hash" TEXT        NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at"    TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_hash_key" ON "password_reset_tokens"("token_hash");
CREATE INDEX "idx_password_reset_user_id"             ON "password_reset_tokens"("user_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "roles" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "roles_slug_key" ON "roles"("slug");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "permissions" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"        TEXT        NOT NULL,
  "slug"        TEXT        NOT NULL,
  "description" TEXT,
  "domain"      TEXT        NOT NULL,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "permissions_slug_key"   ON "permissions"("slug");
CREATE INDEX "idx_permissions_domain"         ON "permissions"("domain");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "role_permissions" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "role_id"       UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_rp_role"       FOREIGN KEY ("role_id")       REFERENCES "roles"("id")       ON DELETE CASCADE,
  CONSTRAINT "fk_rp_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "role_permissions_unique" ON "role_permissions"("role_id", "permission_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "user_roles" (
  "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id"      UUID NOT NULL,
  "role_id"      UUID NOT NULL,
  "workspace_id" UUID NOT NULL,
  CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_ur_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_ur_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "user_roles_unique"           ON "user_roles"("user_id", "role_id", "workspace_id");
CREATE INDEX "idx_user_roles_user_workspace"       ON "user_roles"("user_id", "workspace_id");

-- ============================================================
-- WORKSPACE DOMAIN
-- ============================================================

CREATE TABLE "workspaces" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "code"       TEXT        NOT NULL,
  "name"       TEXT        NOT NULL,
  "created_by" TEXT        NOT NULL,
  "updated_by" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspaces_code_key"  ON "workspaces"("code");
CREATE INDEX "idx_workspaces_created_by"    ON "workspaces"("created_by");
CREATE INDEX "idx_workspaces_deleted_at"    ON "workspaces"("deleted_at");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "workspace_members" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "user_id"      UUID        NOT NULL,
  "role"         TEXT        NOT NULL DEFAULT 'MEMBER',
  "joined_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_wm_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_wm_user"      FOREIGN KEY ("user_id")      REFERENCES "users"("id")      ON DELETE CASCADE
);

CREATE UNIQUE INDEX "workspace_members_unique"  ON "workspace_members"("workspace_id", "user_id");
CREATE INDEX "idx_workspace_members_ws"          ON "workspace_members"("workspace_id");
CREATE INDEX "idx_workspace_members_user"        ON "workspace_members"("user_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "workspace_invitations" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "email"        TEXT        NOT NULL,
  "role"         TEXT        NOT NULL DEFAULT 'MEMBER',
  "token"        TEXT        NOT NULL,
  "invited_by"   UUID        NOT NULL,
  "status"       TEXT        NOT NULL DEFAULT 'pending',
  "expires_at"   TIMESTAMPTZ NOT NULL,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_wi_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_wi_inviter"   FOREIGN KEY ("invited_by")   REFERENCES "users"("id")
);

CREATE UNIQUE INDEX "workspace_invitations_token_key" ON "workspace_invitations"("token");
CREATE INDEX "idx_wi_workspace"                        ON "workspace_invitations"("workspace_id");
CREATE INDEX "idx_wi_email"                            ON "workspace_invitations"("email");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "workspace_settings" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "settings"     JSONB       NOT NULL DEFAULT '{}',
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "workspace_settings_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "workspace_settings_ws_key" UNIQUE ("workspace_id"),
  CONSTRAINT "fk_ws_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
);

-- ============================================================
-- SUBSCRIPTION DOMAIN
-- ============================================================

CREATE TABLE "plans" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"          TEXT        NOT NULL,
  "slug"          TEXT        NOT NULL,
  "monthly_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "yearly_price"  DECIMAL(10,2) NOT NULL DEFAULT 0,
  "features"      JSONB       NOT NULL DEFAULT '{}',
  "is_active"     BOOLEAN     NOT NULL DEFAULT true,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");
CREATE INDEX "idx_plans_is_active"    ON "plans"("is_active");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "subscriptions" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "plan_id"      UUID        NOT NULL,
  "status"       TEXT        NOT NULL DEFAULT 'active',
  "starts_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ends_at"      TIMESTAMPTZ,
  "cancelled_at" TIMESTAMPTZ,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "subscriptions_pkey"  PRIMARY KEY ("id"),
  CONSTRAINT "fk_sub_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_sub_plan"      FOREIGN KEY ("plan_id")      REFERENCES "plans"("id")
);

CREATE INDEX "idx_subscriptions_workspace" ON "subscriptions"("workspace_id");
CREATE INDEX "idx_subscriptions_status"     ON "subscriptions"("status");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "usage_logs" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "feature"      TEXT        NOT NULL,
  "amount"       INT         NOT NULL DEFAULT 1,
  "logged_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_ul_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
);

CREATE INDEX "idx_usage_logs_workspace" ON "usage_logs"("workspace_id");
CREATE INDEX "idx_usage_logs_feature"   ON "usage_logs"("feature");
CREATE INDEX "idx_usage_logs_logged_at" ON "usage_logs"("logged_at");

-- ============================================================
-- BILLING DOMAIN
-- ============================================================

CREATE TABLE "invoices" (
  "id"             UUID          NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"   UUID          NOT NULL,
  "invoice_number" TEXT          NOT NULL,
  "status"         TEXT          NOT NULL DEFAULT 'pending',
  "currency"       TEXT          NOT NULL DEFAULT 'USD',
  "subtotal"       DECIMAL(12,2) NOT NULL,
  "tax_amount"     DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total_amount"   DECIMAL(12,2) NOT NULL,
  "issued_at"      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "due_at"         TIMESTAMPTZ,
  "paid_at"        TIMESTAMPTZ,
  "created_at"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updated_at"     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_inv_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
);

CREATE UNIQUE INDEX "invoices_number_key"   ON "invoices"("invoice_number");
CREATE INDEX "idx_invoices_workspace"        ON "invoices"("workspace_id");
CREATE INDEX "idx_invoices_status"           ON "invoices"("status");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "payments" (
  "id"               UUID          NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"     UUID          NOT NULL,
  "invoice_id"       UUID          NOT NULL,
  "gateway"          TEXT          NOT NULL,
  "reference_number" TEXT,
  "amount"           DECIMAL(12,2) NOT NULL,
  "status"           TEXT          NOT NULL DEFAULT 'pending',
  "paid_at"          TIMESTAMPTZ,
  "created_at"       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT "payments_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "fk_pay_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id")
);

CREATE INDEX "idx_payments_workspace"  ON "payments"("workspace_id");
CREATE INDEX "idx_payments_invoice"    ON "payments"("invoice_id");
CREATE INDEX "idx_payments_status"     ON "payments"("status");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "transactions" (
  "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID          NOT NULL,
  "payment_id"   UUID          NOT NULL,
  "type"         TEXT          NOT NULL,
  "amount"       DECIMAL(12,2) NOT NULL,
  "status"       TEXT          NOT NULL DEFAULT 'pending',
  "metadata"     JSONB         NOT NULL DEFAULT '{}',
  "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT "transactions_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "fk_tx_payment" FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
);

CREATE INDEX "idx_transactions_workspace" ON "transactions"("workspace_id");
CREATE INDEX "idx_transactions_payment"   ON "transactions"("payment_id");

-- ============================================================
-- PROJECT DOMAIN
-- ============================================================

CREATE TABLE "projects" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "name"         TEXT        NOT NULL,
  "description"  TEXT,
  "status"       TEXT        NOT NULL DEFAULT 'active',
  "start_date"   TIMESTAMPTZ,
  "end_date"     TIMESTAMPTZ,
  "created_by"   UUID        NOT NULL,
  "updated_by"   UUID,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at"   TIMESTAMPTZ,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_proj_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_proj_creator"   FOREIGN KEY ("created_by")   REFERENCES "users"("id")
);

CREATE INDEX "idx_projects_workspace" ON "projects"("workspace_id");
CREATE INDEX "idx_projects_status"    ON "projects"("status");
CREATE INDEX "idx_projects_deleted"   ON "projects"("deleted_at");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "project_members" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID        NOT NULL,
  "user_id"    UUID        NOT NULL,
  "role"       TEXT        NOT NULL DEFAULT 'viewer',
  "joined_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "project_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_pm_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_pm_user"    FOREIGN KEY ("user_id")    REFERENCES "users"("id")    ON DELETE CASCADE
);

CREATE UNIQUE INDEX "project_members_unique" ON "project_members"("project_id", "user_id");
CREATE INDEX "idx_project_members_project"    ON "project_members"("project_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "project_notes" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID        NOT NULL,
  "content"    TEXT        NOT NULL,
  "created_by" UUID        NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "project_notes_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "fk_pn_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_pn_author"  FOREIGN KEY ("created_by") REFERENCES "users"("id")
);

CREATE INDEX "idx_project_notes_project" ON "project_notes"("project_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "project_reports" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "project_id" UUID        NOT NULL,
  "file_id"    UUID,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "project_reports_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "fk_pr_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_project_reports_project" ON "project_reports"("project_id");

-- ============================================================
-- ENGINEERING DOMAIN
-- ============================================================

CREATE TABLE "calculations" (
  "id"               UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"     UUID        NOT NULL,
  "project_id"       UUID,
  "user_id"          UUID        NOT NULL,
  "type"             TEXT        NOT NULL,
  "version"          TEXT        NOT NULL,
  "inputs"           JSONB       NOT NULL DEFAULT '{}',
  "results"          JSONB       NOT NULL DEFAULT '{}',
  "engine_version"   TEXT        NOT NULL,
  "standard_version" TEXT        NOT NULL,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "calculations_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "fk_calc_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_calc_project"   FOREIGN KEY ("project_id")   REFERENCES "projects"("id"),
  CONSTRAINT "fk_calc_user"      FOREIGN KEY ("user_id")      REFERENCES "users"("id")
);

CREATE INDEX "idx_calculations_workspace" ON "calculations"("workspace_id");
CREATE INDEX "idx_calculations_project"   ON "calculations"("project_id");
CREATE INDEX "idx_calculations_type"      ON "calculations"("type");
CREATE INDEX "idx_calculations_created"   ON "calculations"("created_at");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "calculation_templates" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"       TEXT        NOT NULL,
  "type"       TEXT        NOT NULL,
  "schema"     JSONB       NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "calculation_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_calc_templates_type" ON "calculation_templates"("type");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "engineering_standards" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "code"         TEXT        NOT NULL,
  "title"        TEXT        NOT NULL,
  "organization" TEXT        NOT NULL,
  "version"      TEXT        NOT NULL,
  "published_at" TIMESTAMPTZ,
  "status"       TEXT        NOT NULL DEFAULT 'active',
  CONSTRAINT "engineering_standards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "engineering_standards_code_key" ON "engineering_standards"("code");
CREATE INDEX "idx_eng_standards_org"                  ON "engineering_standards"("organization");

-- ============================================================
-- AI DOMAIN
-- ============================================================

CREATE TABLE "agents" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"       TEXT        NOT NULL,
  "slug"       TEXT        NOT NULL,
  "version"    TEXT        NOT NULL,
  "is_active"  BOOLEAN     NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "agents_slug_key" ON "agents"("slug");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "conversations" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "agent_id"     UUID        NOT NULL,
  "title"        TEXT,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "conversations_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "fk_conv_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_conv_agent"     FOREIGN KEY ("agent_id")     REFERENCES "agents"("id")
);

CREATE INDEX "idx_conversations_workspace" ON "conversations"("workspace_id");
CREATE INDEX "idx_conversations_agent"     ON "conversations"("agent_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "messages" (
  "id"              UUID        NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" UUID        NOT NULL,
  "role"            TEXT        NOT NULL,
  "content"         TEXT        NOT NULL,
  "metadata"        JSONB       NOT NULL DEFAULT '{}',
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "messages_pkey"        PRIMARY KEY ("id"),
  CONSTRAINT "fk_msg_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_messages_conversation" ON "messages"("conversation_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "ai_usage" (
  "id"                UUID          NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"      UUID          NOT NULL,
  "user_id"           UUID          NOT NULL,
  "agent_id"          UUID,
  "provider"          TEXT          NOT NULL,
  "model"             TEXT          NOT NULL,
  "prompt_tokens"     INT           NOT NULL DEFAULT 0,
  "completion_tokens" INT           NOT NULL DEFAULT 0,
  "total_tokens"      INT           NOT NULL DEFAULT 0,
  "cost"              DECIMAL(10,6) NOT NULL DEFAULT 0,
  "created_at"        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT "ai_usage_pkey"         PRIMARY KEY ("id"),
  CONSTRAINT "fk_ai_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_ai_user"      FOREIGN KEY ("user_id")      REFERENCES "users"("id")
);

CREATE INDEX "idx_ai_usage_workspace" ON "ai_usage"("workspace_id");
CREATE INDEX "idx_ai_usage_user"      ON "ai_usage"("user_id");
CREATE INDEX "idx_ai_usage_created"   ON "ai_usage"("created_at");

-- ============================================================
-- KNOWLEDGE DOMAIN
-- ============================================================

CREATE TABLE "articles" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "slug"         TEXT        NOT NULL,
  "status"       TEXT        NOT NULL DEFAULT 'draft',
  "published_at" TIMESTAMPTZ,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at"   TIMESTAMPTZ,
  CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");
CREATE INDEX "idx_articles_status"       ON "articles"("status");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "article_translations" (
  "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
  "article_id" UUID NOT NULL,
  "locale"     TEXT NOT NULL,
  "title"      TEXT NOT NULL,
  "excerpt"    TEXT,
  "content"    TEXT NOT NULL,
  CONSTRAINT "article_translations_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "fk_at_article" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "article_translations_unique" ON "article_translations"("article_id", "locale");
CREATE INDEX "idx_at_article"                      ON "article_translations"("article_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "categories" (
  "id"        UUID NOT NULL DEFAULT gen_random_uuid(),
  "parent_id" UUID,
  "slug"      TEXT NOT NULL,
  "status"    TEXT NOT NULL DEFAULT 'active',
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_cat_parent" FOREIGN KEY ("parent_id") REFERENCES "categories"("id")
);

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "idx_categories_parent"       ON "categories"("parent_id");

-- ============================================================
-- MARKETPLACE DOMAIN
-- ============================================================

CREATE TABLE "vendors" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"       TEXT        NOT NULL,
  "slug"       TEXT        NOT NULL,
  "status"     TEXT        NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vendors_slug_key" ON "vendors"("slug");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "products" (
  "id"         UUID          NOT NULL DEFAULT gen_random_uuid(),
  "vendor_id"  UUID          NOT NULL,
  "type"       TEXT          NOT NULL,
  "sku"        TEXT          NOT NULL,
  "price"      DECIMAL(12,2) NOT NULL,
  "currency"   TEXT          NOT NULL DEFAULT 'USD',
  "status"     TEXT          NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  CONSTRAINT "products_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "fk_prod_vendor" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id")
);

CREATE UNIQUE INDEX "products_sku_key"  ON "products"("sku");
CREATE INDEX "idx_products_vendor"       ON "products"("vendor_id");
CREATE INDEX "idx_products_status"       ON "products"("status");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "product_translations" (
  "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id"  UUID NOT NULL,
  "locale"      TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "product_translations_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "fk_pt_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "product_translations_unique" ON "product_translations"("product_id", "locale");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "orders" (
  "id"           UUID          NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID          NOT NULL,
  "user_id"      UUID          NOT NULL,
  "status"       TEXT          NOT NULL DEFAULT 'pending',
  "currency"     TEXT          NOT NULL DEFAULT 'USD',
  "total_amount" DECIMAL(12,2) NOT NULL,
  "created_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updated_at"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT "orders_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "fk_ord_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_ord_user"      FOREIGN KEY ("user_id")      REFERENCES "users"("id")
);

CREATE INDEX "idx_orders_workspace" ON "orders"("workspace_id");
CREATE INDEX "idx_orders_user"      ON "orders"("user_id");
CREATE INDEX "idx_orders_status"    ON "orders"("status");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "order_items" (
  "id"          UUID          NOT NULL DEFAULT gen_random_uuid(),
  "order_id"    UUID          NOT NULL,
  "product_id"  UUID          NOT NULL,
  "quantity"    INT           NOT NULL DEFAULT 1,
  "unit_price"  DECIMAL(12,2) NOT NULL,
  "total_price" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "order_items_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "fk_oi_order"   FOREIGN KEY ("order_id")   REFERENCES "orders"("id")   ON DELETE CASCADE,
  CONSTRAINT "fk_oi_product" FOREIGN KEY ("product_id") REFERENCES "products"("id")
);

CREATE INDEX "idx_order_items_order" ON "order_items"("order_id");

-- ============================================================
-- STORAGE DOMAIN
-- ============================================================

CREATE TABLE "files" (
  "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id"  UUID        NOT NULL,
  "bucket"        TEXT        NOT NULL,
  "path"          TEXT        NOT NULL,
  "filename"      TEXT        NOT NULL,
  "original_name" TEXT        NOT NULL,
  "extension"     TEXT        NOT NULL,
  "mime_type"     TEXT        NOT NULL,
  "size"          BIGINT      NOT NULL,
  "checksum"      TEXT,
  "uploaded_by"   UUID        NOT NULL,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at"    TIMESTAMPTZ,
  CONSTRAINT "files_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "fk_file_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_file_uploader"  FOREIGN KEY ("uploaded_by")  REFERENCES "users"("id")
);

CREATE INDEX "idx_files_workspace"  ON "files"("workspace_id");
CREATE INDEX "idx_files_uploader"   ON "files"("uploaded_by");
CREATE INDEX "idx_files_mime"       ON "files"("mime_type");
CREATE INDEX "idx_files_deleted"    ON "files"("deleted_at");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "file_versions" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "file_id"    UUID        NOT NULL,
  "version"    INT         NOT NULL DEFAULT 1,
  "path"       TEXT        NOT NULL,
  "checksum"   TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "file_versions_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "fk_fv_file" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_file_versions_file" ON "file_versions"("file_id");

-- ============================================================
-- API DOMAIN
-- ============================================================

CREATE TABLE "api_keys" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "name"         TEXT        NOT NULL,
  "key_hash"     TEXT        NOT NULL,
  "last_used_at" TIMESTAMPTZ,
  "expires_at"   TIMESTAMPTZ,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "api_keys_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "fk_ak_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "api_keys_hash_key"  ON "api_keys"("key_hash");
CREATE INDEX "idx_api_keys_workspace"    ON "api_keys"("workspace_id");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "webhooks" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID        NOT NULL,
  "url"          TEXT        NOT NULL,
  "secret"       TEXT,
  "events"       JSONB       NOT NULL DEFAULT '[]',
  "is_active"    BOOLEAN     NOT NULL DEFAULT true,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "webhooks_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "fk_wh_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_webhooks_workspace" ON "webhooks"("workspace_id");

-- ============================================================
-- NOTIFICATION DOMAIN
-- ============================================================

CREATE TABLE "notifications" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    UUID        NOT NULL,
  "type"       TEXT        NOT NULL,
  "channel"    TEXT        NOT NULL,
  "title"      TEXT        NOT NULL,
  "content"    TEXT        NOT NULL,
  "status"     TEXT        NOT NULL DEFAULT 'pending',
  "sent_at"    TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "notifications_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "fk_notif_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_notifications_user"    ON "notifications"("user_id");
CREATE INDEX "idx_notifications_status"  ON "notifications"("status");
CREATE INDEX "idx_notifications_created" ON "notifications"("created_at");

-- ============================================================
-- ADMIN DOMAIN
-- ============================================================

CREATE TABLE "system_settings" (
  "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
  "key"        TEXT        NOT NULL,
  "value"      TEXT        NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "feature_flags" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "name"         TEXT        NOT NULL,
  "description"  TEXT,
  "enabled"      BOOLEAN     NOT NULL DEFAULT false,
  "plan_id"      UUID,
  "workspace_id" UUID,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "feature_flags_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "fk_ff_plan" FOREIGN KEY ("plan_id") REFERENCES "plans"("id")
);

CREATE UNIQUE INDEX "feature_flags_name_key" ON "feature_flags"("name");

-- ─────────────────────────────────────────────────────────────

CREATE TABLE "audit_logs" (
  "id"           UUID        NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID,
  "user_id"      UUID,
  "ip_address"   TEXT,
  "user_agent"   TEXT,
  "action"       TEXT        NOT NULL,
  "entity"       TEXT,
  "entity_id"    UUID,
  "old_values"   JSONB,
  "new_values"   JSONB,
  "metadata"     JSONB,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "audit_logs_pkey"          PRIMARY KEY ("id"),
  CONSTRAINT "fk_al_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id"),
  CONSTRAINT "fk_al_user"      FOREIGN KEY ("user_id")      REFERENCES "users"("id")
);

CREATE INDEX "idx_audit_logs_workspace" ON "audit_logs"("workspace_id");
CREATE INDEX "idx_audit_logs_user"      ON "audit_logs"("user_id");
CREATE INDEX "idx_audit_logs_action"    ON "audit_logs"("action");
CREATE INDEX "idx_audit_logs_created"   ON "audit_logs"("created_at");
