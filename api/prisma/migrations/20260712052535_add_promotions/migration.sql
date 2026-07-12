-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "perCustomerLimit" INTEGER;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "autoDiscountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "couponDiscountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentAttempts" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT,
    "status" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "rawPayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorType" TEXT NOT NULL DEFAULT 'SYSTEM',
    "actorId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "bankAccountNumber" TEXT,
    "whatsappNumber" TEXT,
    "bankTransferDeadlineDays" INTEGER NOT NULL DEFAULT 1,
    "supportEmail" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemptions" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_discounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quantity_discounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT,
    "minQuantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quantity_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spend_threshold_discounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minSubtotal" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spend_threshold_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_providerRef_idx" ON "payments"("providerRef");

-- CreateIndex
CREATE INDEX "order_status_events_orderId_idx" ON "order_status_events"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_redemptions_orderId_key" ON "coupon_redemptions"("orderId");

-- CreateIndex
CREATE INDEX "coupon_redemptions_couponId_userId_idx" ON "coupon_redemptions"("couponId", "userId");

-- CreateIndex
CREATE INDEX "auto_discounts_categoryId_isActive_idx" ON "auto_discounts"("categoryId", "isActive");

-- CreateIndex
CREATE INDEX "quantity_discounts_productId_isActive_idx" ON "quantity_discounts"("productId", "isActive");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_discounts" ADD CONSTRAINT "auto_discounts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quantity_discounts" ADD CONSTRAINT "quantity_discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
