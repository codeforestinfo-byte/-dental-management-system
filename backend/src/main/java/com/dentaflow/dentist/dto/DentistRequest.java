package com.dentaflow.dentist.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DentistRequest {

    @NotBlank(message = "Dentist name is required")
    private String dentistName;

    private String gender;

    private String dateOfBirth;

    private String nicNumber;

    @NotBlank(message = "SLMC Registration Number is required")
    private String slmcRegistrationNumber;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    private String qualification;

    private String yearsOfExperience;

    private String licenseExpiryDate;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    private String secondaryPhone;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Address is required")
    private String address;

    private String joiningDate;

    private String employmentType;

    private String department;

    @NotBlank(message = "Consultation fee is required")
    private String consultationFee;

    private String followupFee;

    private String status;

    private String availableDays;
}
