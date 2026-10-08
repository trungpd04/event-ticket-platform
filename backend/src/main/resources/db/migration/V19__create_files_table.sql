-- Create files table for uploaded cloud assets.

CREATE TABLE IF NOT EXISTS files (
    id BIGSERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    public_id VARCHAR(255),
    platform_type VARCHAR(50) NOT NULL,
    file_type INT NOT NULL,
    content_type VARCHAR(100),
    size_bytes BIGINT,
    width INT,
    height INT,
    uploaded_by VARCHAR(255),
    reference_id BIGINT,
    reference_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
