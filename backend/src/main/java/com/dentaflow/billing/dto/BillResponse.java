package com.dentaflow.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillResponse {

    private Long id;
    private String billNumber;
    private Long appointmentId;
    private String patientName;
    private String dentistName;
    private String treatmentName;
    private BigDecimal consultationFee;
    private BigDecimal treatmentFee;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balance;
    private String billStatus;
    private List<PaymentResponse> payments;
    private LocalDateTime createdAt;
}
