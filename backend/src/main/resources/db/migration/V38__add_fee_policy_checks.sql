ALTER TABLE fee_policies
    ADD CONSTRAINT chk_fee_policy_commission CHECK (organizer_commission_rate BETWEEN 0 AND 1),
    ADD CONSTRAINT chk_fee_policy_customer_rate CHECK (customer_fee_rate BETWEEN 0 AND 1),
    ADD CONSTRAINT chk_fee_policy_flat_fee CHECK (customer_flat_fee >= 0);
