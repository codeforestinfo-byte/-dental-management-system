ALTER TABLE treatments
    ADD COLUMN category VARCHAR(50),
    ADD COLUMN estimated_duration_minutes INTEGER;

UPDATE treatments SET
    category = CASE
        WHEN treatment_code = 'TRT-CON-0001' THEN 'Diagnostic'
        WHEN treatment_code = 'TRT-FLG-0001' THEN 'Restorative'
        WHEN treatment_code = 'TRT-RCN-0001' THEN 'Endodontic'
        WHEN treatment_code = 'TRT-EXT-0001' THEN 'Surgical'
        WHEN treatment_code = 'TRT-CLN-0001' THEN 'Preventive'
        WHEN treatment_code = 'TRT-WHN-0001' THEN 'Cosmetic'
        WHEN treatment_code = 'TRT-BRG-0001' THEN 'Prosthodontic'
        WHEN treatment_code = 'TRT-IMP-0001' THEN 'Surgical'
        ELSE 'Other'
    END,
    estimated_duration_minutes = CASE
        WHEN treatment_code = 'TRT-CON-0001' THEN 30
        WHEN treatment_code = 'TRT-FLG-0001' THEN 45
        WHEN treatment_code = 'TRT-RCN-0001' THEN 90
        WHEN treatment_code = 'TRT-EXT-0001' THEN 30
        WHEN treatment_code = 'TRT-CLN-0001' THEN 45
        WHEN treatment_code = 'TRT-WHN-0001' THEN 60
        WHEN treatment_code = 'TRT-BRG-0001' THEN 120
        WHEN treatment_code = 'TRT-IMP-0001' THEN 180
        ELSE 30
    END;
