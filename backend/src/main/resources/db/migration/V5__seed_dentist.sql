INSERT INTO dentists (
    dentist_code, dentist_name, gender, date_of_birth, nic_number,
    slmc_registration_number, specialization, qualification, years_of_experience,
    license_expiry_date, contact_number, secondary_phone, email, address,
    joining_date, employment_type, department, consultation_fee, followup_fee,
    status, available_days, active
) VALUES (
    'DNT-SAS-20260828', 'Dr. Sasindi Dilanka Rathnayaka', 'MALE', '1990-05-15', '901234567V',
    'SLMC/REG/2015/0456', 'Orthodontist', 'BDS, MDS (Orthodontics)', 8,
    '2028-12-31', '+94 77 234 5678', '+94 11 345 6789', 'dr.sasindi@sunrisedental.lk', '45 Temple Road, Colombo 07',
    '2018-03-01', 'Full Time', 'Orthodontics', 5000.00, 3000.00,
    'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true
);
