package com.dentaflow.dentist.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DentistResponse {

    private Long id;
    private String dentistCode;
    private String dentistName;
    private String gender;
    private LocalDate dateOfBirth;
    private String profilePhotoUrl;
    private String nicNumber;
    private String slmcRegistrationNumber;
    private String specialization;
    private String qualification;
    private Integer yearsOfExperience;
    private LocalDate licenseExpiryDate;
    private String contactNumber;
    private String secondaryPhone;
    private String email;
    private String address;
    private LocalDate joiningDate;
    private String employmentType;
    private String department;
    private BigDecimal consultationFee;
    private BigDecimal followupFee;
    private String status;
    private String availableDays;
    private String resumeUrl;
    private Long userId;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
