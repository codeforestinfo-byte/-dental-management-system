package com.dentaflow.treatment;

import com.dentaflow.audit.AuditService;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.common.response.PaginatedResponse;
import com.dentaflow.treatment.dto.TreatmentRequest;
import com.dentaflow.treatment.dto.TreatmentResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/treatments")
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentService treatmentService;
    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<ApiResponse<TreatmentResponse>> createTreatment(
            @Valid @RequestBody TreatmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        TreatmentResponse response = treatmentService.createTreatment(request);
        auditService.logWithUser(userDetails.getUsername(), "CREATE", "TREATMENT",
                response.getId(), "Created treatment: " + response.getTreatmentCode(),
                getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Treatment created successfully", response));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<TreatmentResponse>> getAllTreatments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<TreatmentResponse> treatmentPage = treatmentService.getAllTreatments(page, size, sortBy, sortDir);
        return ResponseEntity.ok(PaginatedResponse.of(
                treatmentPage.getContent(),
                treatmentPage.getNumber(),
                treatmentPage.getTotalPages(),
                treatmentPage.getTotalElements(),
                treatmentPage.getSize()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TreatmentResponse>> getTreatmentById(@PathVariable Long id) {
        TreatmentResponse response = treatmentService.getTreatmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Treatment retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TreatmentResponse>> updateTreatment(
            @PathVariable Long id,
            @Valid @RequestBody TreatmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        TreatmentResponse response = treatmentService.updateTreatment(id, request);
        auditService.logWithUser(userDetails.getUsername(), "UPDATE", "TREATMENT",
                id, "Updated treatment: " + response.getTreatmentCode(),
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Treatment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTreatment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        treatmentService.deleteTreatment(id);
        auditService.logWithUser(userDetails.getUsername(), "DELETE", "TREATMENT",
                id, "Deactivated treatment", getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Treatment deactivated successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TreatmentResponse>>> getActiveTreatments() {
        List<TreatmentResponse> response = treatmentService.getActiveTreatments();
        return ResponseEntity.ok(ApiResponse.success("Active treatments retrieved", response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
