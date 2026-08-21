INSERT INTO roles (role_name) VALUES ('ADMIN'), ('RECEPTIONIST'), ('DENTIST');

INSERT INTO treatments (treatment_code, treatment_name, description, treatment_fee, active) VALUES
('TRT-CON-0001', 'Consultation', 'General dental consultation and examination', 1500.00, true),
('TRT-FLG-0001', 'Filling', 'Dental filling for cavity treatment', 3000.00, true),
('TRT-RCN-0001', 'Root Canal', 'Root canal treatment', 15000.00, true),
('TRT-EXT-0001', 'Extraction', 'Tooth extraction procedure', 5000.00, true),
('TRT-CLN-0001', 'Cleaning', 'Professional dental cleaning', 2500.00, true),
('TRT-WHN-0001', 'Whitening', 'Teeth whitening treatment', 8000.00, true),
('TRT-BRG-0001', 'Bridge', 'Dental bridge installation', 25000.00, true),
('TRT-IMP-0001', 'Implant', 'Dental implant surgery', 50000.00, true);
