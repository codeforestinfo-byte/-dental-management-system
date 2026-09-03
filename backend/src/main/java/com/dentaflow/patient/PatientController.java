package com.dentaflow.patient;

import com.dentaflow.audit.AuditService;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.common.response.PaginatedResponse;
import com.dentaflow.patient.dto.PatientRequest;
import com.dentaflow.patient.dto.PatientResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponse>> createPatient(
            @Valid @RequestBody PatientRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        PatientResponse response = patientService.createPatient(request);
        auditService.logWithUser(userDetails.getUsername(), "CREATE", "PATIENT",
                response.getId(), "Created patient: " + response.getPatientNumber(),
                getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient created successfully", response));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<PatientResponse>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<PatientResponse> patientPage = patientService.getAllPatients(page, size, sortBy, sortDir);
        return ResponseEntity.ok(PaginatedResponse.of(
                patientPage.getContent(),
                patientPage.getNumber(),
                patientPage.getTotalPages(),
                patientPage.getTotalElements(),
                patientPage.getSize()));
    }

    @GetMapping("/barcode")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientByBarcode(@RequestParam String number) {
        PatientResponse response = patientService.getPatientByNumber(number);
        return ResponseEntity.ok(ApiResponse.success("Patient found by barcode", response));
    }

    @GetMapping("/my")
    public ResponseEntity<PaginatedResponse<PatientResponse>> getMyPatients(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<PatientResponse> patientPage = patientService.getMyPatients(
                userDetails.getUsername(), page, size, sortBy, sortDir);
        return ResponseEntity.ok(PaginatedResponse.of(
                patientPage.getContent(),
                patientPage.getNumber(),
                patientPage.getTotalPages(),
                patientPage.getTotalElements(),
                patientPage.getSize()));
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedResponse<PatientResponse>> searchPatients(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<PatientResponse> patientPage = patientService.searchPatients(q, page, size);
        return ResponseEntity.ok(PaginatedResponse.of(
                patientPage.getContent(),
                patientPage.getNumber(),
                patientPage.getTotalPages(),
                patientPage.getTotalElements(),
                patientPage.getSize()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> getPatientById(@PathVariable Long id) {
        PatientResponse response = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        PatientResponse response = patientService.updatePatient(id, request);
        auditService.logWithUser(userDetails.getUsername(), "UPDATE", "PATIENT",
                id, "Updated patient: " + response.getPatientNumber(),
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        patientService.deletePatient(id);
        auditService.logWithUser(userDetails.getUsername(), "DELETE", "PATIENT",
                id, "Deleted patient", getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
