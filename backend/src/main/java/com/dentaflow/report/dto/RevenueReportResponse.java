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
public class RevenueReportResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalRevenue;
    private long totalTransactions;
    private BigDecimal averageTransactionValue;
}
