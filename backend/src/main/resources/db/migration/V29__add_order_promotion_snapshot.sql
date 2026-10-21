ALTER TABLE orders
    ADD COLUMN promotion_discount_percent DECIMAL(5, 2),
    ADD COLUMN promotion_max_discount BIGINT;
