package com.dentaflow.patient.dto;

import com.dentaflow.patient.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {

    private Long id;
    private String patientNumber;
    private String firstName;
    private String lastName;
    private String address;
    private String contactNumber;
    private String email;
    private LocalDate dateOfBirth;
    private Patient.Gender gender;
    private String medicalNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
