package com.dentaflow.billing;

import com.dentaflow.billing.dto.BillResponse;
import com.dentaflow.billing.dto.PaymentRequest;
import com.dentaflow.billing.dto.PaymentResponse;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.common.response.PaginatedResponse;
import com.dentaflow.report.PdfGenerationService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;
    private final PdfGenerationService pdfGenerationService;

    @PostMapping("/generate/{appointmentId}")
    public ResponseEntity<ApiResponse<BillResponse>> generateBill(@PathVariable Long appointmentId) {
        BillResponse response = billService.generateBill(appointmentId);
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
            @RequestParam(defaultValue = "desc") String sortDir) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<BillResponse> billPage = billService.getAllBills(page, size, sortBy, sortDir);
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
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = billService.processPayment(billId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", response));
    }

    @GetMapping("/pdf/{id}")
    public void generateBillPdf(@PathVariable Long id, HttpServletResponse response) throws Exception {
        BillResponse bill = billService.getBillById(id);

        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"bill-" + bill.getBillNumber() + ".pdf\"");

        pdfGenerationService.generateBillPdf(bill, response.getOutputStream());
    }
}
