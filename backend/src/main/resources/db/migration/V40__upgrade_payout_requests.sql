-- 1) Normalize status to VARCHAR to match V21 enum-to-varchar migration.
ALTER TABLE payout_requests ALTER COLUMN status DROP DEFAULT;
ALTER TABLE payout_requests ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
ALTER TABLE payout_requests ALTER COLUMN status SET DEFAULT 'PENDING';
DROP TYPE IF EXISTS payout_status;

-- Ensure event_id is mandatory for per-event payout model.
ALTER TABLE payout_requests ALTER COLUMN event_id SET NOT NULL;

-- 2) Add columns required for audit, reconciliation and double-payout prevention.
ALTER TABLE payout_requests
    ADD COLUMN request_code VARCHAR(50),
    ADD COLUMN gross_ticket_amount BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN discount_amount BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN platform_fee BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN order_count INT NOT NULL DEFAULT 0,
    ADD COLUMN event_end_time_snapshot TIMESTAMP,
    ADD COLUMN hold_until TIMESTAMP,
    ADD COLUMN bank_name VARCHAR(255),
    ADD COLUMN account_number VARCHAR(50),
    ADD COLUMN account_holder VARCHAR(255),
    ADD COLUMN note VARCHAR(500),
    ADD COLUMN rejection_reason VARCHAR(500),
    ADD COLUMN approved_by BIGINT REFERENCES users(id),
    ADD COLUMN approved_at TIMESTAMP,
    ADD COLUMN paid_at TIMESTAMP,
    ADD COLUMN proof_file_id BIGINT,
    ADD COLUMN idempotency_key VARCHAR(100),
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
-- transaction_ref already exists in the original V8 schema and is kept.

-- 3) Generate request codes for existing rows and enforce uniqueness.
UPDATE payout_requests SET request_code = 'PO-' || id WHERE request_code IS NULL;
ALTER TABLE payout_requests ALTER COLUMN request_code SET NOT NULL;
CREATE UNIQUE INDEX uq_payout_requests_code ON payout_requests(request_code);
CREATE UNIQUE INDEX uq_payout_requests_idempotency_key ON payout_requests(idempotency_key)
    WHERE idempotency_key IS NOT NULL;

-- 4) Prevent two active requests for the same event (double payout).
CREATE UNIQUE INDEX uq_payout_active_per_event
    ON payout_requests(event_id)
    WHERE event_id IS NOT NULL AND status IN ('PENDING', 'APPROVED');

CREATE INDEX idx_payout_requests_event ON payout_requests(event_id);
CREATE INDEX idx_payout_requests_created_at ON payout_requests(created_at);

-- 5) Prevent duplicate transaction references on paid requests.
CREATE UNIQUE INDEX uq_payout_requests_transaction_ref_paid
    ON payout_requests(transaction_ref)
    WHERE transaction_ref IS NOT NULL AND status = 'PAID';
