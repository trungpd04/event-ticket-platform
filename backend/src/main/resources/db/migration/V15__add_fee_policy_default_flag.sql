ALTER TABLE fee_policies
    ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX idx_fee_policies_single_default
    ON fee_policies(is_default)
    WHERE is_default = TRUE;

INSERT INTO fee_policies (name, organizer_commission_rate, customer_fee_rate, customer_flat_fee, is_active, is_default)
VALUES ('Gói cơ bản', 0.1, 0.03, 5000, TRUE, TRUE);

