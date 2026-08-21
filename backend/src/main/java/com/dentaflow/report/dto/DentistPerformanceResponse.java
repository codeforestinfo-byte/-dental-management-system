package com.dentaflow.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DentistPerformanceResponse {

    private Long dentistId;
    private String dentistName;
    private String specialization;
    private long totalAppointments;
    private long completedAppointments;
    private BigDecimal totalRevenue;
    private double completionRate;
}
