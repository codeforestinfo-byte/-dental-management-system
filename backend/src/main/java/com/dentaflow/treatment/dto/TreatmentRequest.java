package com.dentaflow.treatment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TreatmentRequest {

    @NotBlank(message = "Treatment name is required")
    private String treatmentName;

    private String description;

    private String category;

    @NotNull(message = "Treatment fee is required")
    private BigDecimal treatmentFee;

    private String estimatedDurationMinutes;
}
