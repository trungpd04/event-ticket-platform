ALTER TABLE events
    ADD COLUMN organizer_commission_rate_snapshot DECIMAL(5,4),
    ADD COLUMN customer_fee_rate_snapshot DECIMAL(5,4),
    ADD COLUMN customer_flat_fee_snapshot BIGINT;

