ALTER TABLE orders
    ADD COLUMN platform_service_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN platform_processing_fee BIGINT NOT NULL DEFAULT 0,
    ADD CONSTRAINT chk_orders_platform_service_fee_non_negative CHECK (platform_service_fee >= 0),
    ADD CONSTRAINT chk_orders_platform_processing_fee_non_negative CHECK (platform_processing_fee >= 0);

-- Backfill existing orders so the breakdown is not empty.
-- Orders created before this migration keep the old total under service fee;
-- processing fee is recorded separately going forward.
UPDATE orders
SET platform_service_fee = platform_fee
WHERE platform_fee > 0
  AND platform_service_fee = 0;

CREATE INDEX IF NOT EXISTS idx_orders_event_status ON orders(event_id, status);
