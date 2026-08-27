package com.dentaflow.patient.dto;

import com.dentaflow.patient.Patient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String address;

    private String contactNumber;

    @Email(message = "Email must be valid")
    private String email;

    @Past(message = "Date of birth must be in the past")
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
}
