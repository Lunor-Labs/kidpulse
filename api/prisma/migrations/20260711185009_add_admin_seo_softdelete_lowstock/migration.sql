-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "lowStockAlert" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT;

-- CreateIndex
CREATE INDEX "categories_deletedAt_idx" ON "categories"("deletedAt");

-- CreateIndex
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");
