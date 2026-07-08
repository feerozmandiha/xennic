-- CreateTable: event_outbox
CREATE TABLE "event_outbox" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_version" INTEGER NOT NULL DEFAULT 1,
    "correlation_id" TEXT NOT NULL,
    "causation_id" TEXT,
    "tracing_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "workspace_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_attempt_at" TIMESTAMP(3),

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: event_outbox unique event_id
CREATE UNIQUE INDEX "event_outbox_event_id_key" ON "event_outbox"("event_id");

-- CreateIndex: event_outbox status + created_at
CREATE INDEX "event_outbox_status_created_at_idx" ON "event_outbox"("status", "created_at");

-- CreateIndex: event_outbox event_id
CREATE INDEX "event_outbox_event_id_idx" ON "event_outbox"("event_id");

-- CreateIndex: event_outbox correlation_id
CREATE INDEX "event_outbox_correlation_id_idx" ON "event_outbox"("correlation_id");

-- CreateIndex: event_outbox workspace_id
CREATE INDEX "event_outbox_workspace_id_idx" ON "event_outbox"("workspace_id");

-- CreateTable: event_process_log
CREATE TABLE "event_process_log" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "handler_name" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "duration_ms" INTEGER,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_process_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: event_process_log unique event_id + handler_name
CREATE UNIQUE INDEX "event_process_log_event_id_handler_name_key" ON "event_process_log"("event_id", "handler_name");

-- CreateIndex: event_process_log event_id
CREATE INDEX "event_process_log_event_id_idx" ON "event_process_log"("event_id");

-- CreateIndex: event_process_log event_type
CREATE INDEX "event_process_log_event_type_idx" ON "event_process_log"("event_type");

-- CreateIndex: event_process_log handler_name
CREATE INDEX "event_process_log_handler_name_idx" ON "event_process_log"("handler_name");

-- CreateIndex: event_process_log status
CREATE INDEX "event_process_log_status_idx" ON "event_process_log"("status");
