ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_code VARCHAR(50) UNIQUE,
    ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50),
    ADD COLUMN IF NOT EXISTS payment_transaction_id BIGINT;

CREATE INDEX idx_orders_payment_code ON orders(payment_code);
