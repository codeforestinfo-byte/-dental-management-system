ALTER TABLE dentists
    ADD COLUMN gender VARCHAR(10),
    ADD COLUMN date_of_birth DATE,
    ADD COLUMN profile_photo_url VARCHAR(500),
    ADD COLUMN nic_number VARCHAR(50),
    ADD COLUMN slmc_registration_number VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN qualification VARCHAR(100),
    ADD COLUMN years_of_experience INTEGER,
    ADD COLUMN license_expiry_date DATE,
    ADD COLUMN secondary_phone VARCHAR(20),
    ADD COLUMN address VARCHAR(500),
    ADD COLUMN joining_date DATE,
    ADD COLUMN employment_type VARCHAR(30),
    ADD COLUMN department VARCHAR(100),
    ADD COLUMN consultation_fee DECIMAL(10,2),
    ADD COLUMN followup_fee DECIMAL(10,2),
    ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN available_days TEXT,
    ADD COLUMN resume_url VARCHAR(500);

ALTER TABLE dentists ALTER COLUMN slmc_registration_number DROP DEFAULT;
