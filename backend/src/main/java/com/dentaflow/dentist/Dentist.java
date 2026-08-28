package com.dentaflow.dentist;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dentists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dentist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dentist_code", nullable = false, unique = true, length = 20)
    private String dentistCode;

    @Column(name = "dentist_name", nullable = false, length = 100)
    private String dentistName;

    @Column(length = 10)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(name = "nic_number", length = 50)
    private String nicNumber;

    @Column(name = "slmc_registration_number", nullable = false, length = 50)
    private String slmcRegistrationNumber;

    @Column(length = 100)
    private String specialization;

    @Column(length = 100)
    private String qualification;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "license_expiry_date")
    private LocalDate licenseExpiryDate;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(name = "secondary_phone", length = 20)
    private String secondaryPhone;

    @Column(length = 100)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "employment_type", length = 30)
    private String employmentType;

    @Column(length = 100)
    private String department;

    @Column(name = "consultation_fee", precision = 10, scale = 2)
    private BigDecimal consultationFee;

    @Column(name = "followup_fee", precision = 10, scale = 2)
    private BigDecimal followupFee;

    @Column(length = 20)
    private String status;

    @Column(name = "available_days", columnDefinition = "TEXT")
    private String availableDays;

    @Column(name = "resume_url", length = 500)
    private String resumeUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
