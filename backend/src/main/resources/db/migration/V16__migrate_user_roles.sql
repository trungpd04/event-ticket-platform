-- Migrate from single role column to user_roles table

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Copy existing roles into the new table
INSERT INTO user_roles (user_id, role)
SELECT id, role FROM users;

-- Remove the old role column
ALTER TABLE users DROP COLUMN role;
