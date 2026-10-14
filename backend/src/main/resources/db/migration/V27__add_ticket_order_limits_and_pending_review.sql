ALTER TABLE ticket_types
    ADD COLUMN IF NOT EXISTS min_per_order INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS max_per_order INT;

UPDATE ticket_types
SET max_per_order = total_quantity
WHERE max_per_order IS NULL;

ALTER TABLE ticket_types
    ALTER COLUMN max_per_order SET NOT NULL;

INSERT INTO option_set_values (option_set_id, code, name, value, color, sort_order, status)
SELECT id, 'PENDING_REVIEW', 'Chờ duyệt', 'PENDING_REVIEW', '#FF9800', 1, 'ACTIVE'
FROM option_sets
WHERE code = 'EVENT_STATUS'
  AND NOT EXISTS (
      SELECT 1
      FROM option_set_values osv
      WHERE osv.option_set_id = option_sets.id
        AND osv.code = 'PENDING_REVIEW'
  );
