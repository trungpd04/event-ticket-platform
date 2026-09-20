ALTER TABLE events
    ADD COLUMN category_id BIGINT REFERENCES categories(id),
    ADD COLUMN province_id BIGINT REFERENCES provinces(id),
    ADD COLUMN ticket_sale_start_time TIMESTAMP,
    ADD COLUMN ticket_sale_end_time TIMESTAMP;

CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_province_id ON events(province_id);
CREATE INDEX idx_events_ticket_sale ON events(ticket_sale_start_time, ticket_sale_end_time);
CREATE INDEX idx_events_time_filter ON events(start_time, end_time, status);

