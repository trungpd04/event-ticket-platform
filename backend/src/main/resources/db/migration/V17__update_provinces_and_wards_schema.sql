-- Align provinces/wards schema with the latest Figma-driven design spec.

-- provinces
ALTER TABLE provinces RENAME COLUMN country TO country_code;

ALTER TABLE provinces ALTER COLUMN short_name SET NOT NULL;

ALTER TABLE provinces ALTER COLUMN code SET NOT NULL;
ALTER TABLE provinces ALTER COLUMN code TYPE VARCHAR(5);

ALTER TABLE provinces ALTER COLUMN place_type SET NOT NULL;

ALTER TABLE provinces ALTER COLUMN country_code SET NOT NULL;
ALTER TABLE provinces ALTER COLUMN country_code TYPE VARCHAR(10);
ALTER TABLE provinces ADD CONSTRAINT provinces_country_code_unique UNIQUE (country_code);

DROP INDEX IF EXISTS idx_provinces_code;
CREATE UNIQUE INDEX provinces_province_code_unique ON provinces (province_code);

-- wards
ALTER TABLE wards ADD COLUMN province_code VARCHAR(6);
UPDATE wards w SET province_code = p.province_code FROM provinces p WHERE w.province_id = p.id;
ALTER TABLE wards ALTER COLUMN province_code SET NOT NULL;

ALTER TABLE wards DROP CONSTRAINT IF EXISTS wards_province_id_fkey;
ALTER TABLE wards DROP COLUMN province_id;

DROP INDEX IF EXISTS idx_wards_province_id;

ALTER TABLE wards ADD CONSTRAINT wards_province_code_foreign
    FOREIGN KEY (province_code) REFERENCES provinces (province_code) ON DELETE CASCADE;
CREATE INDEX wards_province_code_index ON wards (province_code);
