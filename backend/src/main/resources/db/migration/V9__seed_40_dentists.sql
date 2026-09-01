-- Seed 40 dentists with Sri Lankan (Sinhala) names and various specializations

INSERT INTO dentists (
    dentist_code, dentist_name, gender, date_of_birth, nic_number,
    slmc_registration_number, specialization, qualification, years_of_experience,
    license_expiry_date, contact_number, secondary_phone, email, address,
    joining_date, employment_type, department, consultation_fee, followup_fee,
    status, available_days, active
) VALUES

-- 1. General Dentistry
('DNT-001-2026', 'Dr. Kavindu Perera', 'MALE', '1985-03-12', '851234567V',
'SLMC/REG/2010/0001', 'General Dentistry', 'BDS', 15,
'2029-06-30', '+94 71 234 5001', '+94 11 234 6001', 'dr.kavindu@sunrisedental.lk', '10 Galle Road, Colombo 03',
'2015-01-15', 'Full Time', 'General Dentistry', 3500.00, 2000.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 2. Orthodontics
('DNT-002-2026', 'Dr. Nipuni Silva', 'FEMALE', '1988-07-22', '882345678V',
'SLMC/REG/2013/0002', 'Orthodontist', 'BDS, MDS (Orthodontics)', 12,
'2029-12-31', '+94 77 345 6002', '+94 11 345 7002', 'dr.nipuni@sunrisedental.lk', '25 Lake Drive, Colombo 08',
'2018-06-01', 'Full Time', 'Orthodontics', 5500.00, 3500.00,
'ACTIVE', '["MON","WED","FRI"]', true),

-- 3. Oral Surgery
('DNT-003-2026', 'Dr. Chamod Wickramasinghe', 'MALE', '1982-11-05', '823456789V',
'SLMC/REG/2008/0003', 'Oral Surgeon', 'BDS, MDS (Oral Surgery)', 18,
'2030-03-31', '+94 76 456 7003', '+94 11 456 8003', 'dr.chamod@sunrisedental.lk', '30 Station Road, Kandy',
'2014-03-10', 'Full Time', 'Oral Surgery', 7000.00, 4500.00,
'ACTIVE', '["TUE","THU","SAT"]', true),

-- 4. Endodontics
('DNT-004-2026', 'Dr. Tharaka Bandara', 'MALE', '1987-01-18', '874567890V',
'SLMC/REG/2012/0004', 'Endodontist', 'BDS, MDS (Endodontics)', 13,
'2029-09-30', '+94 75 567 8004', '+94 11 567 9004', 'dr.tharaka@sunrisedental.lk', '15 Temple Road, Matale',
'2017-09-01', 'Full Time', 'Endodontics', 6000.00, 4000.00,
'ACTIVE', '["MON","TUE","WED","THU"]', true),

-- 5. Prosthodontics
('DNT-005-2026', 'Dr. Madushi Fernando', 'FEMALE', '1990-05-25', '905678901V',
'SLMC/REG/2015/0005', 'Prosthodontist', 'BDS, MDS (Prosthodontics)', 10,
'2030-06-30', '+94 78 678 9005', '+94 11 678 0005', 'dr.madushi@sunrisedental.lk', '40 Park Street, Colombo 02',
'2019-02-15', 'Full Time', 'Prosthodontics', 6500.00, 4000.00,
'ACTIVE', '["MON","WED","FRI"]', true),

-- 6. Periodontics
('DNT-006-2026', 'Dr. Ashan De Silva', 'MALE', '1984-09-14', '846789012V',
'SLMC/REG/2009/0006', 'Periodontist', 'BDS, MDS (Periodontics)', 16,
'2029-12-31', '+94 72 789 0006', '+94 11 789 1006', 'dr.ashan@sunrisedental.lk', '55 Main Street, Galle',
'2016-04-20', 'Full Time', 'Periodontics', 5800.00, 3800.00,
'ACTIVE', '["TUE","WED","THU","FRI"]', true),

-- 7. Pediatric Dentistry
('DNT-007-2026', 'Dr. Dilini Jayawardena', 'FEMALE', '1991-12-03', '917890123V',
'SLMC/REG/2016/0007', 'Pediatric Dentist', 'BDS, MDS (Pediatric Dentistry)', 9,
'2030-09-30', '+94 73 890 1007', '+94 11 890 2007', 'dr.dilini@sunrisedental.lk', '12 Vihara Road, Negombo',
'2020-01-10', 'Full Time', 'Pediatric Dentistry', 4500.00, 2500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 8. Oral Pathology
('DNT-008-2026', 'Dr. Ruwan Liyanage', 'MALE', '1983-04-20', '838901234V',
'SLMC/REG/2009/0008', 'Oral Pathologist', 'BDS, MDS (Oral Pathology)', 17,
'2030-01-31', '+94 71 901 2008', '+94 11 901 3008', 'dr.ruwan@sunrisedental.lk', '78 Ananda Coomaraswamy Mawatha, Colombo 07',
'2015-07-01', 'Full Time', 'Oral Pathology', 5000.00, 3000.00,
'ACTIVE', '["MON","TUE","WED"]', true),

-- 9. Cosmetic Dentistry
('DNT-009-2026', 'Dr. Sanduni Herath', 'FEMALE', '1989-08-11', '899012345V',
'SLMC/REG/2014/0009', 'Cosmetic Dentist', 'BDS, PGDip (Aesthetic Dentistry)', 11,
'2029-11-30', '+94 77 012 3009', '+94 11 012 4009', 'dr.sanduni@sunrisedental.lk', '22 Independence Avenue, Colombo 07',
'2018-11-01', 'Full Time', 'Cosmetic Dentistry', 8000.00, 5000.00,
'ACTIVE', '["MON","WED","FRI"]', true),

-- 10. Implantology
('DNT-010-2026', 'Dr. Kasun Rajapaksa', 'MALE', '1986-02-28', '860123456V',
'SLMC/REG/2011/0010', 'Implantologist', 'BDS, MDS (Implantology)', 14,
'2030-04-30', '+94 76 123 4010', '+94 11 123 5010', 'dr.kasun@sunrisedental.lk', '33 Bauddhaloka Mawatha, Colombo 07',
'2017-05-15', 'Full Time', 'Implantology', 10000.00, 6000.00,
'ACTIVE', '["TUE","THU","SAT"]', true),

-- 11. Orthodontics
('DNT-011-2026', 'Dr. Thisari Gunasekara', 'FEMALE', '1992-06-15', '921234567V',
'SLMC/REG/2017/0011', 'Orthodontist', 'BDS, MDS (Orthodontics)', 8,
'2030-06-30', '+94 75 234 5011', '+94 11 234 6011', 'dr.thisari@sunrisedental.lk', '48 Keyzer Street, Colombo 11',
'2021-03-01', 'Full Time', 'Orthodontics', 5500.00, 3500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 12. General Dentistry
('DNT-012-2026', 'Dr. Kusal Tennakoon', 'MALE', '1981-10-07', '812345678V',
'SLMC/REG/2007/0012', 'General Dentistry', 'BDS, PGDip (Clinical Dentistry)', 19,
'2029-08-31', '+94 78 345 6012', '+94 11 345 7012', 'dr.kusal@sunrisedental.lk', '105 Peradeniya Road, Kandy',
'2013-08-20', 'Full Time', 'General Dentistry', 4000.00, 2500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 13. Oral and Maxillofacial Surgery
('DNT-013-2026', 'Dr. Dinesh Samarawickrama', 'MALE', '1979-12-25', '793456789V',
'SLMC/REG/2005/0013', 'Oral & Maxillofacial Surgeon', 'BDS, MBBS, MDS', 21,
'2030-12-31', '+94 72 456 7013', '+94 11 456 8013', 'dr.dinesh@sunrisedental.lk', '18 Dharmapala Mawatha, Colombo 07',
'2012-01-10', 'Full Time', 'Oral & Maxillofacial Surgery', 12000.00, 7000.00,
'ACTIVE', '["TUE","WED","THU"]', true),

-- 14. Endodontics
('DNT-014-2026', 'Dr. Ruvini Gunawardena', 'FEMALE', '1993-03-08', '934567890V',
'SLMC/REG/2018/0014', 'Endodontist', 'BDS, MDS (Endodontics)', 7,
'2031-03-31', '+94 73 567 8014', '+94 11 567 9014', 'dr.ruvinir@sunrisedental.lk', '29 Turners Road, Colombo 06',
'2022-07-01', 'Full Time', 'Endodontics', 6000.00, 4000.00,
'ACTIVE', '["MON","WED","FRI"]', true),

-- 15. Prosthodontics
('DNT-015-2026', 'Dr. Mahesh Weerasinghe', 'MALE', '1985-07-19', '855678901V',
'SLMC/REG/2010/0015', 'Prosthodontist', 'BDS, MDS (Prosthodontics)', 15,
'2030-07-31', '+94 71 678 9015', '+94 11 678 0015', 'dr.mahesh@sunrisedental.lk', '62 Galle Face Court, Colombo 03',
'2016-09-15', 'Full Time', 'Prosthodontics', 7000.00, 4500.00,
'ACTIVE', '["MON","TUE","THU","FRI"]', true),

-- 16. Periodontics
('DNT-016-2026', 'Dr. Ama Fernando', 'FEMALE', '1990-01-30', '906789012V',
'SLMC/REG/2015/0016', 'Periodontist', 'BDS, MDS (Periodontics)', 10,
'2029-10-31', '+94 77 789 0016', '+94 11 789 1016', 'dr.ama@sunrisedental.lk', '35 Jawatta Road, Colombo 05',
'2019-04-01', 'Part Time', 'Periodontics', 5500.00, 3500.00,
'ACTIVE', '["SAT","SUN"]', true),

-- 17. Pediatric Dentistry
('DNT-017-2026', 'Dr. Sachithra Amarasinghe', 'FEMALE', '1994-09-12', '947890123V',
'SLMC/REG/2019/0017', 'Pediatric Dentist', 'BDS, MDS (Pediatric Dentistry)', 6,
'2031-09-30', '+94 76 890 1017', '+94 11 890 2017', 'dr.sachithra@sunrisedental.lk', '91 Station Road, Panadura',
'2023-01-15', 'Full Time', 'Pediatric Dentistry', 4500.00, 2500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 18. General Dentistry
('DNT-018-2026', 'Dr. Lahiru Peris', 'MALE', '1987-04-05', '878901234V',
'SLMC/REG/2012/0018', 'General Dentistry', 'BDS', 13,
'2030-04-30', '+94 75 901 2018', '+94 11 901 3018', 'dr.lahiru@sunrisedental.lk', '44 Kadawatha Road, Gampaha',
'2017-06-20', 'Full Time', 'General Dentistry', 3500.00, 2000.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 19. Cosmetic Dentistry
('DNT-019-2026', 'Dr. Nadeesha Ratnayake', 'FEMALE', '1991-11-17', '919012345V',
'SLMC/REG/2016/0019', 'Cosmetic Dentist', 'BDS, PGDip (Aesthetic Dentistry)', 9,
'2030-11-30', '+94 78 012 3019', '+94 11 012 4019', 'dr.nadeesha@sunrisedental.lk', '17 Station Street, Colombo 03',
'2020-08-01', 'Full Time', 'Cosmetic Dentistry', 8000.00, 5000.00,
'ACTIVE', '["TUE","WED","THU"]', true),

-- 20. Implantology
('DNT-020-2026', 'Dr. Ruwan Jayatilleke', 'MALE', '1984-08-23', '840123456V',
'SLMC/REG/2009/0020', 'Implantologist', 'BDS, MDS (Implantology)', 16,
'2031-01-31', '+94 72 123 4020', '+94 11 123 5020', 'dr.ruwan.j@sunrisedental.lk', '56 Peradeniya Road, Kandy',
'2016-02-15', 'Full Time', 'Implantology', 10000.00, 6000.00,
'ACTIVE', '["MON","WED","FRI"]', true),

-- 21. Oral Pathology
('DNT-021-2026', 'Dr. Chamila Udugama', 'FEMALE', '1986-05-29', '861234567V',
'SLMC/REG/2011/0021', 'Oral Pathologist', 'BDS, MDS (Oral Pathology)', 14,
'2030-05-31', '+94 73 234 5021', '+94 11 234 6021', 'dr.chamila@sunrisedental.lk', '83 Lincon Corner, Colombo 06',
'2017-10-01', 'Part Time', 'Oral Pathology', 5000.00, 3000.00,
'ACTIVE', '["MON","FRI"]', true),

-- 22. Orthodontics
('DNT-022-2026', 'Dr. Nuwan Bandaranaike', 'MALE', '1983-02-14', '832345678V',
'SLMC/REG/2008/0022', 'Orthodontist', 'BDS, MDS (Orthodontics)', 18,
'2031-02-28', '+94 71 345 6022', '+94 11 345 7022', 'dr.nuwan@sunrisedental.lk', '20 Bauddhaloka Mawatha, Colombo 07',
'2014-04-10', 'Full Time', 'Orthodontics', 5500.00, 3500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 23. General Dentistry
('DNT-023-2026', 'Dr. Saman Kumara', 'MALE', '1980-06-30', '803456789V',
'SLMC/REG/2006/0023', 'General Dentistry', 'BDS, PGDip (Clinical Dentistry)', 20,
'2030-06-30', '+94 77 456 7023', '+94 11 456 8023', 'dr.saman@sunrisedental.lk', '112 Kandy Road, Galigamuwa',
'2012-05-15', 'Full Time', 'General Dentistry', 4000.00, 2500.00,
'ACTIVE', '["TUE","WED","THU","FRI"]', true),

-- 24. Endodontics
('DNT-024-2026', 'Dr. Ishara Mendis', 'FEMALE', '1995-01-08', '954567890V',
'SLMC/REG/2020/0024', 'Endodontist', 'BDS, MDS (Endodontics)', 5,
'2031-12-31', '+94 76 567 8024', '+94 11 567 9024', 'dr.ishara@sunrisedental.lk', '7 Cinnamon Gardens, Colombo 07',
'2023-06-01', 'Full Time', 'Endodontics', 6000.00, 4000.00,
'ACTIVE', '["MON","TUE","WED","THU"]', true),

-- 25. Prosthodontics
('DNT-025-2026', 'Dr. Chathura Senanayake', 'MALE', '1988-10-20', '885678901V',
'SLMC/REG/2013/0025', 'Prosthodontist', 'BDS, MDS (Prosthodontics)', 12,
'2030-10-31', '+94 75 678 9025', '+94 11 678 0025', 'dr.chathura@sunrisedental.lk', '29 Temple Road, Mount Lavinia',
'2018-03-15', 'Full Time', 'Prosthodontics', 7000.00, 4500.00,
'ACTIVE', '["MON","TUE","WED","FRI"]', true),

-- 26. Periodontics
('DNT-026-2026', 'Dr. Thilini Samaraweera', 'FEMALE', '1989-03-15', '896789012V',
'SLMC/REG/2014/0026', 'Periodontist', 'BDS, MDS (Periodontics)', 11,
'2031-03-31', '+94 78 789 0026', '+94 11 789 1026', 'dr.thilini@sunrisedental.lk', '42 Reid Avenue, Colombo 05',
'2019-09-01', 'Full Time', 'Periodontics', 5500.00, 3500.00,
'ACTIVE', '["TUE","WED","THU","SAT"]', true),

-- 27. Pediatric Dentistry
('DNT-027-2026', 'Dr. Pubudu Dissanayake', 'FEMALE', '1993-07-22', '937890123V',
'SLMC/REG/2018/0027', 'Pediatric Dentist', 'BDS, MDS (Pediatric Dentistry)', 7,
'2030-07-31', '+94 72 890 1027', '+94 11 890 2027', 'dr.pubudu@sunrisedental.lk', '15 Lake Roundabout, Kandy',
'2021-11-15', 'Full Time', 'Pediatric Dentistry', 4500.00, 2500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 28. Oral Surgery
('DNT-028-2026', 'Dr. Anura Fernando', 'MALE', '1982-09-03', '828901234V',
'SLMC/REG/2007/0028', 'Oral Surgeon', 'BDS, MDS (Oral Surgery)', 19,
'2031-09-30', '+94 73 901 2028', '+94 11 901 3028', 'dr.anura@sunrisedental.lk', '66 Colombo Road, Kurunegala',
'2014-08-20', 'Full Time', 'Oral Surgery', 7000.00, 4500.00,
'ACTIVE', '["MON","WED","FRI","SAT"]', true),

-- 29. General Dentistry
('DNT-029-2026', 'Dr. Kumari Jayasuriya', 'FEMALE', '1987-12-11', '879012345V',
'SLMC/REG/2012/0029', 'General Dentistry', 'BDS', 13,
'2030-12-31', '+94 71 012 3029', '+94 11 012 4029', 'dr.kumari@sunrisedental.lk', '33 Temperley Place, Colombo 02',
'2017-01-10', 'Full Time', 'General Dentistry', 3500.00, 2000.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 30. Cosmetic Dentistry
('DNT-030-2026', 'Dr. Nirosha Wijesinghe', 'FEMALE', '1992-04-18', '920123456V',
'SLMC/REG/2017/0030', 'Cosmetic Dentist', 'BDS, PGDip (Aesthetic Dentistry)', 8,
'2031-04-30', '+94 77 123 4030', '+94 11 123 5030', 'dr.nirosha@sunrisedental.lk', '21 Station Road, Gampaha',
'2021-05-01', 'Part Time', 'Cosmetic Dentistry', 8000.00, 5000.00,
'ACTIVE', '["SAT","SUN"]', true),

-- 31. Implantology
('DNT-031-2026', 'Dr. Prasanna Herath', 'MALE', '1981-07-27', '811234567V',
'SLMC/REG/2006/0031', 'Implantologist', 'BDS, MDS (Implantology)', 20,
'2031-07-31', '+94 76 234 5031', '+94 11 234 6031', 'dr.prasanna@sunrisedental.lk', '90 Katubedda, Moratuwa',
'2015-03-15', 'Full Time', 'Implantology', 10000.00, 6000.00,
'ACTIVE', '["MON","TUE","WED"]', true),

-- 32. Orthodontics
('DNT-032-2026', 'Dr. Hashini Perera', 'FEMALE', '1994-11-25', '942345678V',
'SLMC/REG/2019/0032', 'Orthodontist', 'BDS, MDS (Orthodontics)', 6,
'2031-11-30', '+94 75 345 6032', '+94 11 345 7032', 'dr.hashini@sunrisedental.lk', '14 Sri Jayawardenepura, Kotte',
'2022-09-01', 'Full Time', 'Orthodontics', 5500.00, 3500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 33. Endodontics
('DNT-033-2026', 'Dr. Nishantha Cooray', 'MALE', '1986-01-16', '863456789V',
'SLMC/REG/2011/0033', 'Endodontist', 'BDS, MDS (Endodontics)', 14,
'2030-01-31', '+94 78 456 7033', '+94 11 456 8033', 'dr.nishantha@sunrisedental.lk', '55 Colombo Road, Kalutara',
'2017-04-10', 'Full Time', 'Endodontics', 6000.00, 4000.00,
'ACTIVE', '["TUE","THU","SAT"]', true),

-- 34. Prosthodontics
('DNT-034-2026', 'Dr. Gayani Soysa', 'FEMALE', '1989-05-03', '894567890V',
'SLMC/REG/2014/0034', 'Prosthodontist', 'BDS, MDS (Prosthodontics)', 11,
'2031-05-31', '+94 72 567 8034', '+94 11 567 9034', 'dr.gayani@sunrisedental.lk', '28 Havelock Road, Colombo 05',
'2019-07-15', 'Full Time', 'Prosthodontics', 7000.00, 4500.00,
'ACTIVE', '["MON","WED","FRI"]', true),

-- 35. Periodontics
('DNT-035-2026', 'Dr. Sarath Jayawardena', 'MALE', '1984-12-09', '845678901V',
'SLMC/REG/2009/0035', 'Periodontist', 'BDS, MDS (Periodontics)', 16,
'2030-12-31', '+94 73 678 9035', '+94 11 678 0035', 'dr.sarath@sunrisedental.lk', '100 Union Place, Colombo 02',
'2016-06-20', 'Full Time', 'Periodontics', 5500.00, 3500.00,
'ACTIVE', '["MON","TUE","WED","THU"]', true),

-- 36. General Dentistry
('DNT-036-2026', 'Dr. Mallika Gunaratne', 'FEMALE', '1990-08-14', '906789012V',
'SLMC/REG/2015/0036', 'General Dentistry', 'BDS', 10,
'2030-08-31', '+94 71 789 0036', '+94 11 789 1036', 'dr.mallika@sunrisedental.lk', '7 Bullers Lane, Colombo 07',
'2020-02-01', 'Full Time', 'General Dentistry', 3500.00, 2000.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 37. Oral Surgery
('DNT-037-2026', 'Dr. Jagath Peris', 'MALE', '1983-06-21', '836789012V',
'SLMC/REG/2008/0037', 'Oral Surgeon', 'BDS, MDS (Oral Surgery)', 17,
'2031-06-30', '+94 77 890 1037', '+94 11 890 2037', 'dr.jagath@sunrisedental.lk', '45 Temple Trees Road, Nugegoda',
'2015-11-01', 'Full Time', 'Oral Surgery', 7000.00, 4500.00,
'ACTIVE', '["TUE","WED","THU","FRI"]', true),

-- 38. Pediatric Dentistry
('DNT-038-2026', 'Dr. Dilrukshi Fonseka', 'FEMALE', '1995-02-28', '957890123V',
'SLMC/REG/2020/0038', 'Pediatric Dentist', 'BDS, MDS (Pediatric Dentistry)', 5,
'2032-02-28', '+94 76 901 2038', '+94 11 901 3038', 'dr.dilrukshi@sunrisedental.lk', '19 Lake Drive, Nawala',
'2023-09-15', 'Full Time', 'Pediatric Dentistry', 4500.00, 2500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true),

-- 39. Cosmetic Dentistry
('DNT-039-2026', 'Dr. Roshan Bandara', 'MALE', '1988-10-05', '889012345V',
'SLMC/REG/2013/0039', 'Cosmetic Dentist', 'BDS, PGDip (Aesthetic Dentistry)', 12,
'2030-10-31', '+94 75 012 3039', '+94 11 012 4039', 'dr.roshan@sunrisedental.lk', '62 Rockhill Road, Colombo 07',
'2018-01-20', 'Full Time', 'Cosmetic Dentistry', 8000.00, 5000.00,
'ACTIVE', '["MON","WED","FRI","SAT"]', true),

-- 40. General Dentistry
('DNT-040-2026', 'Dr. Sumithra Rajapaksa', 'FEMALE', '1991-06-12', '910123456V',
'SLMC/REG/2016/0040', 'General Dentistry', 'BDS, PGDip (Clinical Dentistry)', 9,
'2031-06-30', '+94 78 123 4040', '+94 11 123 5040', 'dr.sumithra@sunrisedental.lk', '33 Gothatuwa Road, Rajagiriya',
'2020-10-01', 'Full Time', 'General Dentistry', 4000.00, 2500.00,
'ACTIVE', '["MON","TUE","WED","THU","FRI"]', true);
