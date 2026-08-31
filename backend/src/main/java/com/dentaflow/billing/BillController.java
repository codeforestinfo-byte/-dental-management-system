package com.dentaflow.billing;

import com.dentaflow.appointment.dto.AppointmentResponse;
import com.dentaflow.audit.AuditService;
import com.dentaflow.billing.dto.BillResponse;
import com.dentaflow.billing.dto.PaymentRequest;
import com.dentaflow.billing.dto.PaymentResponse;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.common.response.PaginatedResponse;
import com.dentaflow.report.PdfGenerationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final PdfGenerationService pdfGenerationService;
    private final AuditService auditService;

    @PostMapping("/generate/{appointmentId}")
    public ResponseEntity<ApiResponse<BillResponse>> generateBill(
            @PathVariable Long appointmentId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        BillResponse response = billService.generateBill(appointmentId);
        auditService.logWithUser(userDetails.getUsername(), "CREATE", "BILL",
                response.getId(), "Generated bill: " + response.getBillNumber(),
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Bill generated successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@PathVariable Long id) {
        BillResponse response = billService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.success("Bill retrieved", response));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<BillResponse>> getAllBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<BillResponse> billPage = billService.getAllBills(page, size, sortBy, sortDir, status, search);
        return ResponseEntity.ok(PaginatedResponse.of(
                billPage.getContent(),
                billPage.getNumber(),
                billPage.getTotalPages(),
                billPage.getTotalElements(),
                billPage.getSize()));
    }

    @PostMapping("/{billId}/payments")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @PathVariable Long billId,
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        PaymentResponse response = billService.processPayment(billId, request);
        auditService.logWithUser(userDetails.getUsername(), "PAYMENT", "BILL",
                billId, "Processed payment of " + request.getPaymentAmount() + " via " + request.getPaymentMethod(),
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
    }

    @PostMapping("/{billId}/refund")
    public ResponseEntity<ApiResponse<BillResponse>> processRefund(
            @PathVariable Long billId,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        BillResponse response = billService.processRefund(billId);
        auditService.logWithUser(userDetails.getUsername(), "REFUND", "BILL",
                billId, "Refunded bill: " + response.getBillNumber(),
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Bill refunded successfully", response));
    }

    @GetMapping("/appointments/without-bills")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getCompletedAppointmentsWithoutBills() {
        List<AppointmentResponse> response = billService.getCompletedAppointmentsWithoutBills();
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", response));
    }

    @GetMapping("/pdf/{id}")
    public void generateBillPdf(@PathVariable Long id, HttpServletResponse response) throws Exception {
        BillResponse bill = billService.getBillById(id);

        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"bill-" + bill.getBillNumber() + ".pdf\"");

        pdfGenerationService.generateBillPdf(bill, response.getOutputStream());
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
