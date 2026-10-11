ALTER TABLE tickets ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
DROP TYPE IF EXISTS ticket_status;

ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(20) USING status::text;
DROP TYPE IF EXISTS order_status;
