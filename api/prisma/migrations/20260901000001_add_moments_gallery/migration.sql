CREATE TABLE "moments_gallery_items" (
    "id"        TEXT NOT NULL,
    "imageUrl"  TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moments_gallery_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "moments_gallery_items_isActive_deletedAt_sortOrder_idx"
    ON "moments_gallery_items"("isActive", "deletedAt", "sortOrder");