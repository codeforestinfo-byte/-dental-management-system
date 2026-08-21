package com.dentaflow.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReportResponse {

    private LocalDate reportDate;
    private long totalAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long totalPatientsSeen;
    private BigDecimal totalRevenue;
    private long totalBills;
}
