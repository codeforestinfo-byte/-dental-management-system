package com.dentaflow.dentist.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DentistRequest {

    @NotBlank(message = "Dentist name is required")
    private String dentistName;

    private String specialization;

    private String contactNumber;

    @Email(message = "Email must be valid")
    private String email;
}
