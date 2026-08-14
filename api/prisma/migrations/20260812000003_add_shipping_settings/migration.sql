-- Add shipping settings to AdminSettings
ALTER TABLE "admin_settings" ADD COLUMN "defaultShippingCost" DECIMAL(10,2) NOT NULL DEFAULT 350;
ALTER TABLE "admin_settings" ADD COLUMN "freeShippingThreshold" DECIMAL(10,2) NOT NULL DEFAULT 5000;