CREATE TABLE dentist_attendance (
    id BIGSERIAL PRIMARY KEY,
    dentist_id BIGINT NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dentist_id, attendance_date)
);

CREATE INDEX idx_dentist_attendance_date ON dentist_attendance(attendance_date);
CREATE INDEX idx_dentist_attendance_dentist ON dentist_attendance(dentist_id);
