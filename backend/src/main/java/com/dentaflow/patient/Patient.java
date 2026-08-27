package com.dentaflow.patient;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_number", nullable = false, unique = true, length = 20)
    private String patientNumber;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(length = 200)
    private String address;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(length = 100)
    private String email;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(name = "medical_notes", columnDefinition = "TEXT")
    private String medicalNotes;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Column(name = "national_id", length = 50)
    private String nationalId;

    @Column(name = "marital_status", length = 20)
    private String maritalStatus;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_number", length = 20)
    private String emergencyContactNumber;

    @Column(name = "emergency_contact_relationship", length = 50)
    private String emergencyContactRelationship;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "current_medications", columnDefinition = "TEXT")
    private String currentMedications;

    @Column(name = "has_diabetes")
    private Boolean hasDiabetes = false;

    @Column(name = "has_hypertension")
    private Boolean hasHypertension = false;

    @Column(name = "has_heart_disease")
    private Boolean hasHeartDisease = false;

    @Column(name = "has_asthma")
    private Boolean hasAsthma = false;

    @Column(name = "has_epilepsy")
    private Boolean hasEpilepsy = false;

    @Column(name = "has_bleeding_disorders")
    private Boolean hasBleedingDisorders = false;

    @Column(name = "pregnancy_status", length = 20)
    private String pregnancyStatus;

    @Column(name = "smoking_status", length = 20)
    private String smokingStatus;

    @Column(name = "alcohol_consumption", length = 20)
    private String alcoholConsumption;

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "previous_dental_treatments", columnDefinition = "TEXT")
    private String previousDentalTreatments;

    @Column(name = "last_dental_visit_date")
    private LocalDate lastDentalVisitDate;

    @Column(name = "referred_by", length = 100)
    private String referredBy;

    @Column(name = "preferred_dentist", length = 100)
    private String preferredDentist;

    @Column(name = "insurance_provider", length = 100)
    private String insuranceProvider;

    @Column(name = "insurance_policy_number", length = 50)
    private String insurancePolicyNumber;

    @Column(name = "insurance_coverage_details", columnDefinition = "TEXT")
    private String insuranceCoverageDetails;

    @Column(name = "insurance_expiry_date")
    private LocalDate insuranceExpiryDate;

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(length = 20)
    private String status;

    @Column(name = "consent_accepted")
    private Boolean consentAccepted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Gender {
        MALE, FEMALE, OTHER
    }
}
