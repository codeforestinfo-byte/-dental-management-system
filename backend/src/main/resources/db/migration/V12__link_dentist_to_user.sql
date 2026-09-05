ALTER TABLE dentists ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_dentists_user_id ON dentists(user_id);
