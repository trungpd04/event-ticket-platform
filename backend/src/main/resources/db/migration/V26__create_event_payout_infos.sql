-- Store bank payout information per event.

CREATE TABLE event_payout_infos (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    account_holder VARCHAR(255),
    branch VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_payout_infos_event_id ON event_payout_infos(event_id);
