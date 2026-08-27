package com.dentaflow.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRequest {

    @Email(message = "Email must be valid")
    private String email;

    private Set<String> roles;

    @NotNull(message = "Enabled status is required")
    private Boolean enabled;
}
