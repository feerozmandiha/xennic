/*
  Warnings:

  - The primary key for the `agents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ai_usage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `api_keys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `article_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `articles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `calculation_templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `calculations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `status` on the `categories` table. All the data in the column will be lost.
  - The primary key for the `conversations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `engineering_standards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `feature_flags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `file_versions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `files` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `invoices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `order_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `password_reset_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `project_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `project_notes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `project_reports` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `projects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `system_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `usage_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `vendors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `webhooks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workspace_invitations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workspace_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workspace_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workspaces` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `name` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ai_usage" DROP CONSTRAINT "fk_ai_user";

-- DropForeignKey
ALTER TABLE "ai_usage" DROP CONSTRAINT "fk_ai_workspace";

-- DropForeignKey
ALTER TABLE "api_keys" DROP CONSTRAINT "fk_ak_workspace";

-- DropForeignKey
ALTER TABLE "article_translations" DROP CONSTRAINT "fk_at_article";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "fk_al_user";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "fk_al_workspace";

-- DropForeignKey
ALTER TABLE "calculations" DROP CONSTRAINT "fk_calc_project";

-- DropForeignKey
ALTER TABLE "calculations" DROP CONSTRAINT "fk_calc_user";

-- DropForeignKey
ALTER TABLE "calculations" DROP CONSTRAINT "fk_calc_workspace";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "fk_cat_parent";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "fk_conv_agent";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "fk_conv_workspace";

-- DropForeignKey
ALTER TABLE "feature_flags" DROP CONSTRAINT "fk_ff_plan";

-- DropForeignKey
ALTER TABLE "file_versions" DROP CONSTRAINT "fk_fv_file";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "fk_file_uploader";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "fk_file_workspace";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "fk_inv_workspace";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "fk_msg_conversation";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "fk_notif_user";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "fk_oi_order";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "fk_oi_product";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "fk_ord_user";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "fk_ord_workspace";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "fk_pay_invoice";

-- DropForeignKey
ALTER TABLE "product_translations" DROP CONSTRAINT "fk_pt_product";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "fk_prod_vendor";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "fk_pm_project";

-- DropForeignKey
ALTER TABLE "project_members" DROP CONSTRAINT "fk_pm_user";

-- DropForeignKey
ALTER TABLE "project_notes" DROP CONSTRAINT "fk_pn_author";

-- DropForeignKey
ALTER TABLE "project_notes" DROP CONSTRAINT "fk_pn_project";

-- DropForeignKey
ALTER TABLE "project_reports" DROP CONSTRAINT "fk_pr_project";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "fk_proj_creator";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "fk_proj_workspace";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "fk_refresh_tokens_user";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "fk_rp_permission";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "fk_rp_role";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "fk_sessions_user";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "fk_sub_plan";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "fk_sub_workspace";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "fk_tx_payment";

-- DropForeignKey
ALTER TABLE "usage_logs" DROP CONSTRAINT "fk_ul_workspace";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "fk_ur_role";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "fk_ur_user";

-- DropForeignKey
ALTER TABLE "webhooks" DROP CONSTRAINT "fk_wh_workspace";

-- DropForeignKey
ALTER TABLE "workspace_invitations" DROP CONSTRAINT "fk_wi_inviter";

-- DropForeignKey
ALTER TABLE "workspace_invitations" DROP CONSTRAINT "fk_wi_workspace";

-- DropForeignKey
ALTER TABLE "workspace_members" DROP CONSTRAINT "fk_wm_user";

-- DropForeignKey
ALTER TABLE "workspace_members" DROP CONSTRAINT "fk_wm_workspace";

-- DropForeignKey
ALTER TABLE "workspace_settings" DROP CONSTRAINT "fk_ws_workspace";

-- DropIndex
DROP INDEX "idx_files_deleted";

-- AlterTable
ALTER TABLE "agents" DROP CONSTRAINT "agents_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "agents_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ai_usage" DROP CONSTRAINT "ai_usage_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "agent_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "last_used_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "article_translations" DROP CONSTRAINT "article_translations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "article_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "articles" DROP CONSTRAINT "articles_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "published_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "entity_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "calculation_templates" DROP CONSTRAINT "calculation_templates_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "calculation_templates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "calculations" DROP CONSTRAINT "calculations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "project_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "calculations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey",
DROP COLUMN "status",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "name_en" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "parent_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "agent_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "engineering_standards" DROP CONSTRAINT "engineering_standards_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "published_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "engineering_standards_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "feature_flags" DROP CONSTRAINT "feature_flags_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "plan_id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "file_versions" DROP CONSTRAINT "file_versions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "file_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "file_versions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "files" DROP CONSTRAINT "files_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "uploaded_by" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "files_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "issued_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "due_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "paid_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "messages" DROP CONSTRAINT "messages_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "conversation_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "sent_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "order_id" SET DATA TYPE TEXT,
ALTER COLUMN "product_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "used_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
ADD COLUMN     "authority" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "invoice_id" SET DATA TYPE TEXT,
ALTER COLUMN "paid_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "plans" DROP CONSTRAINT "plans_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "product_translations" DROP CONSTRAINT "product_translations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "product_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "products" DROP CONSTRAINT "products_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "vendor_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "project_members" DROP CONSTRAINT "project_members_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "project_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "joined_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "project_notes" DROP CONSTRAINT "project_notes_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "project_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "project_notes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "project_reports" DROP CONSTRAINT "project_reports_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "project_id" SET DATA TYPE TEXT,
ALTER COLUMN "file_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "project_reports_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "projects" DROP CONSTRAINT "projects_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "start_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "end_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_by" SET DATA TYPE TEXT,
ALTER COLUMN "updated_by" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "revoked_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "role_id" SET DATA TYPE TEXT,
ALTER COLUMN "permission_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_pkey",
ADD COLUMN     "workspace_id" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_activity_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "plan_id" SET DATA TYPE TEXT,
ALTER COLUMN "starts_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "ends_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "cancelled_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "system_settings" DROP CONSTRAINT "system_settings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "payment_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "usage_logs" DROP CONSTRAINT "usage_logs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "logged_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "role_id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "avatar_file_id" SET DATA TYPE TEXT,
ALTER COLUMN "email_verified_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_login" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "vendors" DROP CONSTRAINT "vendors_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "webhooks" DROP CONSTRAINT "webhooks_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workspace_invitations" DROP CONSTRAINT "workspace_invitations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "invited_by" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "workspace_invitations_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workspace_members" DROP CONSTRAINT "workspace_members_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "joined_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workspace_settings" DROP CONSTRAINT "workspace_settings_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workspace_id" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "workspace_settings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "gateway_customer_id" TEXT,
    "masked_number" TEXT,
    "card_holder_name" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_payments" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "payment_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_comments" (
    "id" TEXT NOT NULL,
    "article_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "liked_by" JSONB DEFAULT '[]',
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "article_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplines" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audiences" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_en" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "language" TEXT NOT NULL DEFAULT 'fa',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "content" JSONB NOT NULL DEFAULT '{}',
    "reading_time" INTEGER,
    "difficulty" TEXT,
    "author_id" TEXT,
    "reviewer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_translations" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'fa',
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "content" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_taxonomy" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "taxonomy_type" TEXT NOT NULL,
    "taxonomy_id" TEXT NOT NULL,

    CONSTRAINT "knowledge_taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_media" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption_fa" TEXT,
    "caption_en" TEXT,
    "alt_fa" TEXT,
    "alt_en" TEXT,
    "description" TEXT,
    "license" TEXT,
    "source" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_formulas" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "latex" TEXT NOT NULL,
    "mathml" TEXT,
    "description_fa" TEXT,
    "description_en" TEXT,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "calculator_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_examples" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "title_en" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'basic',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "answer" JSONB,
    "calculator_type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_standards" (
    "knowledge_id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,

    CONSTRAINT "knowledge_standards_pkey" PRIMARY KEY ("knowledge_id","standard_id")
);

-- CreateTable
CREATE TABLE "knowledge_versions" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "comment" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_comments" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "liked_by" JSONB NOT NULL DEFAULT '[]',
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "knowledge_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_workflows" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "current_status" TEXT NOT NULL DEFAULT 'draft',
    "assigned_to" TEXT,
    "reviewer_id" TEXT,
    "review_comment" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_workflow_history" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_workflow_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_analytics" (
    "id" TEXT NOT NULL,
    "knowledge_id" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "bookmarks" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "avg_reading_time" INTEGER,
    "last_viewed_at" TIMESTAMP(3),
    "daily_stats" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_methods_workspace_id_idx" ON "payment_methods"("workspace_id");

-- CreateIndex
CREATE INDEX "payment_methods_user_id_idx" ON "payment_methods"("user_id");

-- CreateIndex
CREATE INDEX "payment_methods_gateway_idx" ON "payment_methods"("gateway");

-- CreateIndex
CREATE INDEX "payment_methods_is_default_idx" ON "payment_methods"("is_default");

-- CreateIndex
CREATE INDEX "subscription_payments_workspace_id_idx" ON "subscription_payments"("workspace_id");

-- CreateIndex
CREATE INDEX "subscription_payments_subscription_id_idx" ON "subscription_payments"("subscription_id");

-- CreateIndex
CREATE INDEX "subscription_payments_status_idx" ON "subscription_payments"("status");

-- CreateIndex
CREATE INDEX "subscription_payments_period_start_idx" ON "subscription_payments"("period_start");

-- CreateIndex
CREATE INDEX "article_comments_article_id_idx" ON "article_comments"("article_id");

-- CreateIndex
CREATE INDEX "article_comments_user_id_idx" ON "article_comments"("user_id");

-- CreateIndex
CREATE INDEX "article_comments_parent_id_idx" ON "article_comments"("parent_id");

-- CreateIndex
CREATE INDEX "article_comments_created_at_idx" ON "article_comments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_slug_idx" ON "topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_slug_idx" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_slug_key" ON "disciplines"("slug");

-- CreateIndex
CREATE INDEX "disciplines_slug_idx" ON "disciplines"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "audiences_slug_key" ON "audiences"("slug");

-- CreateIndex
CREATE INDEX "audiences_slug_idx" ON "audiences"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_slug_key" ON "knowledge"("slug");

-- CreateIndex
CREATE INDEX "knowledge_slug_idx" ON "knowledge"("slug");

-- CreateIndex
CREATE INDEX "knowledge_status_idx" ON "knowledge"("status");

-- CreateIndex
CREATE INDEX "knowledge_visibility_idx" ON "knowledge"("visibility");

-- CreateIndex
CREATE INDEX "knowledge_language_idx" ON "knowledge"("language");

-- CreateIndex
CREATE INDEX "knowledge_difficulty_idx" ON "knowledge"("difficulty");

-- CreateIndex
CREATE INDEX "knowledge_author_id_idx" ON "knowledge"("author_id");

-- CreateIndex
CREATE INDEX "knowledge_translations_knowledge_id_idx" ON "knowledge_translations"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_translations_language_idx" ON "knowledge_translations"("language");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_translations_knowledge_id_language_key" ON "knowledge_translations"("knowledge_id", "language");

-- CreateIndex
CREATE INDEX "knowledge_taxonomy_knowledge_id_idx" ON "knowledge_taxonomy"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_taxonomy_taxonomy_type_idx" ON "knowledge_taxonomy"("taxonomy_type");

-- CreateIndex
CREATE INDEX "knowledge_taxonomy_taxonomy_id_idx" ON "knowledge_taxonomy"("taxonomy_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_taxonomy_knowledge_id_taxonomy_type_taxonomy_id_key" ON "knowledge_taxonomy"("knowledge_id", "taxonomy_type", "taxonomy_id");

-- CreateIndex
CREATE INDEX "knowledge_media_knowledge_id_idx" ON "knowledge_media"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_media_type_idx" ON "knowledge_media"("type");

-- CreateIndex
CREATE INDEX "knowledge_formulas_knowledge_id_idx" ON "knowledge_formulas"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_formulas_calculator_type_idx" ON "knowledge_formulas"("calculator_type");

-- CreateIndex
CREATE INDEX "knowledge_examples_knowledge_id_idx" ON "knowledge_examples"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_standards_knowledge_id_idx" ON "knowledge_standards"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_standards_standard_id_idx" ON "knowledge_standards"("standard_id");

-- CreateIndex
CREATE INDEX "knowledge_versions_knowledge_id_idx" ON "knowledge_versions"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_versions_created_at_idx" ON "knowledge_versions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_versions_knowledge_id_version_key" ON "knowledge_versions"("knowledge_id", "version");

-- CreateIndex
CREATE INDEX "knowledge_comments_knowledge_id_idx" ON "knowledge_comments"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_comments_user_id_idx" ON "knowledge_comments"("user_id");

-- CreateIndex
CREATE INDEX "knowledge_comments_parent_id_idx" ON "knowledge_comments"("parent_id");

-- CreateIndex
CREATE INDEX "knowledge_comments_created_at_idx" ON "knowledge_comments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_workflows_knowledge_id_key" ON "knowledge_workflows"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_workflows_knowledge_id_idx" ON "knowledge_workflows"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_workflows_current_status_idx" ON "knowledge_workflows"("current_status");

-- CreateIndex
CREATE INDEX "knowledge_workflows_assigned_to_idx" ON "knowledge_workflows"("assigned_to");

-- CreateIndex
CREATE INDEX "knowledge_workflows_reviewer_id_idx" ON "knowledge_workflows"("reviewer_id");

-- CreateIndex
CREATE INDEX "knowledge_workflow_history_workflow_id_idx" ON "knowledge_workflow_history"("workflow_id");

-- CreateIndex
CREATE INDEX "knowledge_workflow_history_user_id_idx" ON "knowledge_workflow_history"("user_id");

-- CreateIndex
CREATE INDEX "knowledge_workflow_history_created_at_idx" ON "knowledge_workflow_history"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_analytics_knowledge_id_key" ON "knowledge_analytics"("knowledge_id");

-- CreateIndex
CREATE INDEX "knowledge_analytics_knowledge_id_idx" ON "knowledge_analytics"("knowledge_id");

-- CreateIndex
CREATE INDEX "agents_slug_idx" ON "agents"("slug");

-- CreateIndex
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- CreateIndex
CREATE INDEX "engineering_standards_code_idx" ON "engineering_standards"("code");

-- CreateIndex
CREATE INDEX "feature_flags_name_idx" ON "feature_flags"("name");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_idx" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "permissions_slug_idx" ON "permissions"("slug");

-- CreateIndex
CREATE INDEX "plans_slug_idx" ON "plans"("slug");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "roles_slug_idx" ON "roles"("slug");

-- CreateIndex
CREATE INDEX "system_settings_key_idx" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "vendors_slug_idx" ON "vendors"("slug");

-- CreateIndex
CREATE INDEX "workspace_invitations_token_idx" ON "workspace_invitations"("token");

-- CreateIndex
CREATE INDEX "workspaces_code_idx" ON "workspaces"("code");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_settings" ADD CONSTRAINT "workspace_settings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_notes" ADD CONSTRAINT "project_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_reports" ADD CONSTRAINT "project_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "article_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_translations" ADD CONSTRAINT "knowledge_translations_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_taxonomy" ADD CONSTRAINT "knowledge_taxonomy_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_media" ADD CONSTRAINT "knowledge_media_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_formulas" ADD CONSTRAINT "knowledge_formulas_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_examples" ADD CONSTRAINT "knowledge_examples_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_standards" ADD CONSTRAINT "knowledge_standards_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_standards" ADD CONSTRAINT "knowledge_standards_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "engineering_standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_versions" ADD CONSTRAINT "knowledge_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_comments" ADD CONSTRAINT "knowledge_comments_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_comments" ADD CONSTRAINT "knowledge_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_comments" ADD CONSTRAINT "knowledge_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "knowledge_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_workflows" ADD CONSTRAINT "knowledge_workflows_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_workflows" ADD CONSTRAINT "knowledge_workflows_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_workflows" ADD CONSTRAINT "knowledge_workflows_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_workflow_history" ADD CONSTRAINT "knowledge_workflow_history_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "knowledge_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_workflow_history" ADD CONSTRAINT "knowledge_workflow_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_analytics" ADD CONSTRAINT "knowledge_analytics_knowledge_id_fkey" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_ai_usage_created" RENAME TO "ai_usage_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_ai_usage_user" RENAME TO "ai_usage_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_ai_usage_workspace" RENAME TO "ai_usage_workspace_id_idx";

-- RenameIndex
ALTER INDEX "api_keys_hash_key" RENAME TO "api_keys_key_hash_key";

-- RenameIndex
ALTER INDEX "idx_api_keys_workspace" RENAME TO "api_keys_workspace_id_idx";

-- RenameIndex
ALTER INDEX "article_translations_unique" RENAME TO "article_translations_article_id_locale_key";

-- RenameIndex
ALTER INDEX "idx_at_article" RENAME TO "article_translations_article_id_idx";

-- RenameIndex
ALTER INDEX "idx_articles_status" RENAME TO "articles_status_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_action" RENAME TO "audit_logs_action_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_created" RENAME TO "audit_logs_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_user" RENAME TO "audit_logs_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_audit_logs_workspace" RENAME TO "audit_logs_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_calc_templates_type" RENAME TO "calculation_templates_type_idx";

-- RenameIndex
ALTER INDEX "idx_calculations_created" RENAME TO "calculations_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_calculations_project" RENAME TO "calculations_project_id_idx";

-- RenameIndex
ALTER INDEX "idx_calculations_type" RENAME TO "calculations_type_idx";

-- RenameIndex
ALTER INDEX "idx_calculations_workspace" RENAME TO "calculations_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_categories_parent" RENAME TO "categories_parent_id_idx";

-- RenameIndex
ALTER INDEX "idx_conversations_agent" RENAME TO "conversations_agent_id_idx";

-- RenameIndex
ALTER INDEX "idx_conversations_workspace" RENAME TO "conversations_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_eng_standards_org" RENAME TO "engineering_standards_organization_idx";

-- RenameIndex
ALTER INDEX "idx_file_versions_file" RENAME TO "file_versions_file_id_idx";

-- RenameIndex
ALTER INDEX "idx_files_mime" RENAME TO "files_mime_type_idx";

-- RenameIndex
ALTER INDEX "idx_files_uploader" RENAME TO "files_uploaded_by_idx";

-- RenameIndex
ALTER INDEX "idx_files_workspace" RENAME TO "files_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_invoices_status" RENAME TO "invoices_status_idx";

-- RenameIndex
ALTER INDEX "idx_invoices_workspace" RENAME TO "invoices_workspace_id_idx";

-- RenameIndex
ALTER INDEX "invoices_number_key" RENAME TO "invoices_invoice_number_key";

-- RenameIndex
ALTER INDEX "idx_messages_conversation" RENAME TO "messages_conversation_id_idx";

-- RenameIndex
ALTER INDEX "idx_notifications_created" RENAME TO "notifications_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_notifications_status" RENAME TO "notifications_status_idx";

-- RenameIndex
ALTER INDEX "idx_notifications_user" RENAME TO "notifications_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_order_items_order" RENAME TO "order_items_order_id_idx";

-- RenameIndex
ALTER INDEX "idx_orders_status" RENAME TO "orders_status_idx";

-- RenameIndex
ALTER INDEX "idx_orders_user" RENAME TO "orders_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_orders_workspace" RENAME TO "orders_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_password_reset_user_id" RENAME TO "password_reset_tokens_user_id_idx";

-- RenameIndex
ALTER INDEX "password_reset_tokens_hash_key" RENAME TO "password_reset_tokens_token_hash_key";

-- RenameIndex
ALTER INDEX "idx_payments_invoice" RENAME TO "payments_invoice_id_idx";

-- RenameIndex
ALTER INDEX "idx_payments_status" RENAME TO "payments_status_idx";

-- RenameIndex
ALTER INDEX "idx_payments_workspace" RENAME TO "payments_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_permissions_domain" RENAME TO "permissions_domain_idx";

-- RenameIndex
ALTER INDEX "idx_plans_is_active" RENAME TO "plans_is_active_idx";

-- RenameIndex
ALTER INDEX "product_translations_unique" RENAME TO "product_translations_product_id_locale_key";

-- RenameIndex
ALTER INDEX "idx_products_status" RENAME TO "products_status_idx";

-- RenameIndex
ALTER INDEX "idx_products_vendor" RENAME TO "products_vendor_id_idx";

-- RenameIndex
ALTER INDEX "idx_project_members_project" RENAME TO "project_members_project_id_idx";

-- RenameIndex
ALTER INDEX "project_members_unique" RENAME TO "project_members_project_id_user_id_key";

-- RenameIndex
ALTER INDEX "idx_project_notes_project" RENAME TO "project_notes_project_id_idx";

-- RenameIndex
ALTER INDEX "idx_project_reports_project" RENAME TO "project_reports_project_id_idx";

-- RenameIndex
ALTER INDEX "idx_projects_deleted" RENAME TO "projects_deleted_at_idx";

-- RenameIndex
ALTER INDEX "idx_projects_status" RENAME TO "projects_status_idx";

-- RenameIndex
ALTER INDEX "idx_projects_workspace" RENAME TO "projects_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_refresh_tokens_user_id" RENAME TO "refresh_tokens_user_id_idx";

-- RenameIndex
ALTER INDEX "role_permissions_unique" RENAME TO "role_permissions_role_id_permission_id_key";

-- RenameIndex
ALTER INDEX "idx_sessions_expires_at" RENAME TO "sessions_expires_at_idx";

-- RenameIndex
ALTER INDEX "idx_sessions_user_id" RENAME TO "sessions_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_subscriptions_status" RENAME TO "subscriptions_status_idx";

-- RenameIndex
ALTER INDEX "idx_subscriptions_workspace" RENAME TO "subscriptions_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_payment" RENAME TO "transactions_payment_id_idx";

-- RenameIndex
ALTER INDEX "idx_transactions_workspace" RENAME TO "transactions_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_usage_logs_feature" RENAME TO "usage_logs_feature_idx";

-- RenameIndex
ALTER INDEX "idx_usage_logs_logged_at" RENAME TO "usage_logs_logged_at_idx";

-- RenameIndex
ALTER INDEX "idx_usage_logs_workspace" RENAME TO "usage_logs_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_user_roles_user_workspace" RENAME TO "user_roles_user_id_workspace_id_idx";

-- RenameIndex
ALTER INDEX "user_roles_unique" RENAME TO "user_roles_user_id_role_id_workspace_id_key";

-- RenameIndex
ALTER INDEX "idx_users_created_at" RENAME TO "users_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_users_deleted_at" RENAME TO "users_deleted_at_idx";

-- RenameIndex
ALTER INDEX "idx_webhooks_workspace" RENAME TO "webhooks_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_wi_email" RENAME TO "workspace_invitations_email_idx";

-- RenameIndex
ALTER INDEX "idx_wi_workspace" RENAME TO "workspace_invitations_workspace_id_idx";

-- RenameIndex
ALTER INDEX "idx_workspace_members_user" RENAME TO "workspace_members_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_workspace_members_ws" RENAME TO "workspace_members_workspace_id_idx";

-- RenameIndex
ALTER INDEX "workspace_members_unique" RENAME TO "workspace_members_workspace_id_user_id_key";

-- RenameIndex
ALTER INDEX "workspace_settings_ws_key" RENAME TO "workspace_settings_workspace_id_key";

-- RenameIndex
ALTER INDEX "idx_workspaces_created_by" RENAME TO "workspaces_created_by_idx";

-- RenameIndex
ALTER INDEX "idx_workspaces_deleted_at" RENAME TO "workspaces_deleted_at_idx";
