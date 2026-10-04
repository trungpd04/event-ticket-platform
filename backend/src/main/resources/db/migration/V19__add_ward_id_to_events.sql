-- Add ward reference to events for more precise address information.

ALTER TABLE events ADD COLUMN IF NOT EXISTS ward_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'events_ward_id_fkey' AND conrelid = 'events'::regclass
    ) THEN
        ALTER TABLE events ADD CONSTRAINT events_ward_id_fkey
            FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL;
    END IF;
END $$;
