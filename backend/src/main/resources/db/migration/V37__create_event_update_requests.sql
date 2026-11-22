CREATE TYPE event_update_request_status AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

CREATE TABLE event_update_requests
(
    id               BIGSERIAL PRIMARY KEY,
    event_id         BIGINT       NOT NULL REFERENCES events (id),
    organizer_id     BIGINT       NOT NULL REFERENCES users (id),
    payload          JSONB        NOT NULL,
    status           event_update_request_status NOT NULL DEFAULT 'PENDING_REVIEW',
    rejection_reason VARCHAR(500),
    reviewed_by      BIGINT REFERENCES users (id),
    reviewed_at      TIMESTAMP,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_update_requests_event_id ON event_update_requests (event_id);
CREATE INDEX idx_event_update_requests_status ON event_update_requests (status);
CREATE INDEX idx_event_update_requests_created_at ON event_update_requests (created_at DESC);
