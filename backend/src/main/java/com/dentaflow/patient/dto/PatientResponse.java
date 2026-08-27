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
    private String alternatePhone;
    private String nationalId;
    private String maritalStatus;
    private String profilePhotoUrl;
    private String addressLine2;
    private String city;
    private String postalCode;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private String emergencyContactRelationship;
    private String bloodGroup;
    private String allergies;
    private String currentMedications;
    private Boolean hasDiabetes;
    private Boolean hasHypertension;
    private Boolean hasHeartDisease;
    private Boolean hasAsthma;
    private Boolean hasEpilepsy;
    private Boolean hasBleedingDisorders;
    private String pregnancyStatus;
    private String smokingStatus;
    private String alcoholConsumption;
    private String chiefComplaint;
    private String previousDentalTreatments;
    private LocalDate lastDentalVisitDate;
    private String referredBy;
    private String preferredDentist;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceCoverageDetails;
    private LocalDate insuranceExpiryDate;
    private LocalDate registrationDate;
    private String status;
    private Boolean consentAccepted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
