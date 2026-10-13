-- Drop column defaults first: they reference the enum types and would
-- otherwise block DROP TYPE after the column type change.

ALTER TABLE tickets ALTER COLUMN status DROP DEFAULT;
ALTER TABLE tickets ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'AVAILABLE';
DROP TYPE IF EXISTS ticket_status;

ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'PENDING_PAYMENT';
DROP TYPE IF EXISTS order_status;
