-- Remove seed/test data inserted by V5 (delete dependents first)
DELETE FROM payments WHERE bill_id IN (
    SELECT b.id FROM bills b
    JOIN appointments a ON b.appointment_id = a.id
    JOIN dentists d ON a.dentist_id = d.id
    WHERE d.dentist_code = 'DNT-SAS-20260828'
);
DELETE FROM bills WHERE appointment_id IN (
    SELECT a.id FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    WHERE d.dentist_code = 'DNT-SAS-20260828'
);
DELETE FROM appointments WHERE dentist_id IN (
    SELECT id FROM dentists WHERE dentist_code = 'DNT-SAS-20260828'
);
DELETE FROM dentists WHERE dentist_code = 'DNT-SAS-20260828';
