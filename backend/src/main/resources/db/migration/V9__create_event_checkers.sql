CREATE TABLE event_checkers (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    checker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, checker_id)
);

CREATE INDEX idx_event_checkers_event_id ON event_checkers(event_id);
CREATE INDEX idx_event_checkers_checker_id ON event_checkers(checker_id);
