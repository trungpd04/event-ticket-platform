-- Split event settings into a dedicated 1-1 table.

CREATE TABLE event_settings (
    event_id BIGINT PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
    refund_policy TEXT,
    age_restriction VARCHAR(50),
    tags TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
