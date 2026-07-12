-- CreateTable
CREATE TABLE "admin_action_log" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT,
    "actorRole" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "statusCode" INTEGER NOT NULL,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_action_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_action_log_actorId_createdAt_idx" ON "admin_action_log"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "admin_action_log_entity_entityId_idx" ON "admin_action_log"("entity", "entityId");

-- CreateIndex
CREATE INDEX "admin_action_log_createdAt_idx" ON "admin_action_log"("createdAt");
