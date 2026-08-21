package com.dentaflow.treatment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TreatmentRequest {

    @NotBlank(message = "Treatment name is required")
    private String treatmentName;

    private String description;

    @NotNull(message = "Treatment fee is required")
    @Positive(message = "Treatment fee must be positive")
    private BigDecimal treatmentFee;
}
