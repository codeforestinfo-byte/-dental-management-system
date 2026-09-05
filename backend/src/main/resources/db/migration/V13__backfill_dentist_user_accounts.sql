-- Backfill user accounts for existing dentists who don't have one
-- Default password: dentist123 (BCrypt encoded)

DO $$
DECLARE
    dent_rec RECORD;
    clean_name TEXT;
    base_username TEXT;
    final_username TEXT;
    final_email TEXT;
    counter INT;
    bcrypt_hash TEXT := '$2b$10$pVpPfbaHpVFnmZ1lnU.t3OcRSgaH51AMvJsIfI7c/ele6703ZPe2K';
    dentist_role_id INT := 3;
BEGIN
    FOR dent_rec IN
        SELECT d.id, d.dentist_name, d.email
        FROM dentists d
        WHERE d.user_id IS NULL
    LOOP
        -- Generate username the same way as Java generateUsername()
        clean_name := lower(regexp_replace(regexp_replace(regexp_replace(trim(dent_rec.dentist_name), '^dr\.?\s*', ''), '[^a-zA-Z\s]', '', 'g'), '\s+', '.', 'g'));
        IF length(clean_name) > 30 THEN
            clean_name := substring(clean_name FROM 1 FOR 30);
        END IF;
        IF clean_name LIKE '%.' THEN
            clean_name := substring(clean_name FROM 1 FOR length(clean_name) - 1);
        END IF;
        base_username := 'dr.' || clean_name;

        -- Handle duplicate usernames
        final_username := base_username;
        counter := 1;
        WHILE EXISTS (SELECT 1 FROM users WHERE username = final_username) LOOP
            final_username := base_username || counter;
            counter := counter + 1;
        END LOOP;

        -- Handle duplicate emails
        final_email := dent_rec.email;
        IF final_email IS NULL OR final_email = '' OR EXISTS (SELECT 1 FROM users WHERE email = final_email) THEN
            final_email := final_username || '@sunrisedental.lk';
        END IF;

        -- Create the user
        INSERT INTO users (username, email, password_hash, enabled, created_at)
        VALUES (final_username, final_email, bcrypt_hash, true, CURRENT_TIMESTAMP)
        RETURNING id INTO counter;

        -- Link user role
        INSERT INTO user_roles (user_id, role_id) VALUES (counter, dentist_role_id);

        -- Link user to dentist
        UPDATE dentists SET user_id = counter WHERE id = dent_rec.id;

        RAISE NOTICE 'Created user % for dentist % (id=%)', final_username, dent_rec.dentist_name, dent_rec.id;
    END LOOP;
END $$;
