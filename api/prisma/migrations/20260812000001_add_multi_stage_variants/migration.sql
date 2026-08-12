-- Add hasMultiStageVariants to Product
ALTER TABLE "products" ADD COLUMN "hasMultiStageVariants" BOOLEAN NOT NULL DEFAULT false;

-- Create VariantStage table
CREATE TABLE "variant_stages" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "maxSelect" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_stages_pkey" PRIMARY KEY ("id")
);

-- Create VariantStageOption table
CREATE TABLE "variant_stage_options" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "selectCount" INTEGER,
    "priceOverride" DECIMAL(10,2),
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_stage_options_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on variant_stages
CREATE UNIQUE INDEX "variant_stages_productId_stageOrder_key" ON "variant_stages"("productId", "stageOrder");

-- Add indexes
CREATE INDEX "variant_stages_productId_idx" ON "variant_stages"("productId");
CREATE INDEX "variant_stage_options_stageId_isActive_idx" ON "variant_stage_options"("stageId", "isActive");

-- Add foreign keys
ALTER TABLE "variant_stages" ADD CONSTRAINT "variant_stages_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "variant_stage_options" ADD CONSTRAINT "variant_stage_options_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "variant_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;