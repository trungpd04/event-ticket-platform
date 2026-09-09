CREATE TYPE payout_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

CREATE TABLE payout_requests (
    id BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT NOT NULL REFERENCES users(id),
    event_id BIGINT REFERENCES events(id),
    gross_revenue BIGINT NOT NULL DEFAULT 0,
    commission_fee BIGINT NOT NULL DEFAULT 0,
    net_revenue BIGINT NOT NULL DEFAULT 0,
    bank_account VARCHAR(255),
    transaction_ref VARCHAR(255),
    status payout_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payout_requests_organizer_id ON payout_requests(organizer_id);
CREATE INDEX idx_payout_requests_status ON payout_requests(status);
