-- Keep the database constraint aligned with
-- com.trungpd.eventticketplatform.events.entity.EventStatus.
-- Older databases may have been created with a manually-added constraint that
-- predates the ONGOING and PENDING_REVIEW lifecycle states.
ALTER TABLE events
    DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE events
    ADD CONSTRAINT events_status_check
    CHECK (status IN ('PENDING', 'PENDING_REVIEW', 'PUBLISHED', 'ONGOING', 'CLOSED'));

-- Keep the admin option set aligned as well. This is idempotent and only adds
-- the missing ONGOING display value; existing rows are preserved.
INSERT INTO option_set_values (option_set_id, code, name, value, color, sort_order, status)
SELECT id,
       'ONGOING',
       'Đang diễn ra',
       'ONGOING',
       '#2196F3',
       3,
       'ACTIVE'
FROM option_sets
WHERE code = 'EVENT_STATUS'
  AND NOT EXISTS (
      SELECT 1
      FROM option_set_values osv
      WHERE osv.option_set_id = option_sets.id
        AND osv.code = 'ONGOING'
  );
