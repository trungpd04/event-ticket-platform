CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    icon_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_active ON categories(is_active);

INSERT INTO categories (name, slug, icon_url, is_active) VALUES
    ('Thể thao', 'the-thao', NULL, TRUE),
    ('Ca nhạc', 'ca-nhac', NULL, TRUE),
    ('Kịch', 'kich', NULL, TRUE),
    ('Hội thảo', 'hoi-thao', NULL, TRUE),
    ('Triển lãm', 'trien-lam', NULL, TRUE),
    ('Khác', 'khac', NULL, TRUE);

