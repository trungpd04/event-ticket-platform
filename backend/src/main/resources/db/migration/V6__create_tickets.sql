CREATE TYPE ticket_status AS ENUM ('AVAILABLE', 'RESERVED', 'PAID', 'USED');

CREATE TABLE tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_type_id BIGINT NOT NULL REFERENCES ticket_types(id),
    event_id BIGINT NOT NULL REFERENCES events(id),
    status ticket_status NOT NULL DEFAULT 'AVAILABLE',
    reserved_until TIMESTAMP,
    order_detail_id BIGINT,
    qr_code VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_ticket_type_id_status ON tickets(ticket_type_id, status, reserved_until);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_order_detail_id ON tickets(order_detail_id);
