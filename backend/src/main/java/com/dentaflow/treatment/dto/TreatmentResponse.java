package com.dentaflow.treatment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentResponse {

    private Long id;
    private String treatmentCode;
    private String treatmentName;
    private String description;
    private BigDecimal treatmentFee;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
