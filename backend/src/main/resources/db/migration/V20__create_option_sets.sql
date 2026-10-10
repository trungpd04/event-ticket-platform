CREATE TABLE option_sets (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE option_set_values (
    id BIGSERIAL PRIMARY KEY,
    option_set_id BIGINT NOT NULL REFERENCES option_sets(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value VARCHAR(500),
    color VARCHAR(20),
    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_option_set_value_code UNIQUE (option_set_id, code)
);

CREATE INDEX idx_option_set_values_option_set_id ON option_set_values(option_set_id);
CREATE INDEX idx_option_set_values_code ON option_set_values(code);

-- Seed event statuses
INSERT INTO option_sets (code, name, description, status) VALUES
('EVENT_STATUS', 'Trạng thái sự kiện', 'Các trạng thái sự kiện dùng trong admin', 'ACTIVE');

INSERT INTO option_set_values (option_set_id, code, name, value, color, sort_order, status) VALUES
((SELECT id FROM option_sets WHERE code = 'EVENT_STATUS'), 'PENDING',   'Chờ duyệt',   'PENDING',   '#FFA500', 1, 'ACTIVE'),
((SELECT id FROM option_sets WHERE code = 'EVENT_STATUS'), 'PUBLISHED', 'Đã publish', 'PUBLISHED', '#4CAF50', 2, 'ACTIVE'),
((SELECT id FROM option_sets WHERE code = 'EVENT_STATUS'), 'CLOSED',    'Đã đóng',    'CLOSED',    '#F44336', 3, 'ACTIVE');
