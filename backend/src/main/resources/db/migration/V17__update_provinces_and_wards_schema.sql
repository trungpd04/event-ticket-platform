-- Align provinces/wards schema with the latest Figma-driven design spec.
-- Made idempotent so it can be re-run after a partial failure.

-- provinces
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'provinces' AND column_name = 'country'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'provinces' AND column_name = 'country_code'
    ) THEN
        ALTER TABLE provinces RENAME COLUMN country TO country_code;
    END IF;
END $$;

ALTER TABLE provinces ALTER COLUMN short_name SET NOT NULL;

ALTER TABLE provinces ALTER COLUMN code SET NOT NULL;
ALTER TABLE provinces ALTER COLUMN code TYPE VARCHAR(5);

ALTER TABLE provinces ALTER COLUMN place_type SET NOT NULL;

ALTER TABLE provinces ALTER COLUMN country_code SET NOT NULL;
ALTER TABLE provinces ALTER COLUMN country_code TYPE VARCHAR(10);

DROP INDEX IF EXISTS provinces_country_code_unique;
ALTER TABLE provinces DROP CONSTRAINT IF EXISTS provinces_country_code_unique;
-- country_code is intentionally not unique: many provinces share the same country (e.g., VN)
CREATE INDEX IF NOT EXISTS provinces_country_code_index ON provinces (country_code);

DROP INDEX IF EXISTS idx_provinces_code;
DROP INDEX IF EXISTS provinces_province_code_unique;
CREATE UNIQUE INDEX IF NOT EXISTS provinces_province_code_unique ON provinces (province_code);

-- wards
ALTER TABLE wards ADD COLUMN IF NOT EXISTS province_code VARCHAR(6);
UPDATE wards w SET province_code = p.province_code FROM provinces p WHERE w.province_id = p.id AND w.province_code IS NULL;
ALTER TABLE wards ALTER COLUMN province_code SET NOT NULL;

ALTER TABLE wards DROP CONSTRAINT IF EXISTS wards_province_id_fkey;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'wards' AND column_name = 'province_id'
    ) THEN
        ALTER TABLE wards DROP COLUMN province_id;
    END IF;
END $$;

DROP INDEX IF EXISTS idx_wards_province_id;

ALTER TABLE wards DROP CONSTRAINT IF EXISTS wards_province_code_foreign;
ALTER TABLE wards ADD CONSTRAINT wards_province_code_foreign
    FOREIGN KEY (province_code) REFERENCES provinces (province_code) ON DELETE CASCADE;
DROP INDEX IF EXISTS wards_province_code_index;
CREATE INDEX IF NOT EXISTS wards_province_code_index ON wards (province_code);
