CREATE TABLE provinces (
    id BIGSERIAL PRIMARY KEY,
    province_code VARCHAR(2) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(255),
    code VARCHAR(10),
    place_type VARCHAR(255),
    country VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provinces_code ON provinces(province_code);

