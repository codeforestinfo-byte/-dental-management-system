package com.dentaflow.dentist;

import com.dentaflow.audit.AuditService;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.common.response.PaginatedResponse;
import com.dentaflow.dentist.dto.DentistRequest;
import com.dentaflow.dentist.dto.DentistResponse;
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
@RequestMapping("/api/v1/dentists")
@RequiredArgsConstructor
public class DentistController {

    private final DentistService dentistService;
    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<ApiResponse<DentistResponse>> createDentist(
            @Valid @RequestBody DentistRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        DentistResponse response = dentistService.createDentist(request);
        auditService.logWithUser(userDetails.getUsername(), "CREATE", "DENTIST",
                response.getId(), "Created dentist: " + response.getDentistCode(),
                getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dentist created successfully", response));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<DentistResponse>> getAllDentists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<DentistResponse> dentistPage = dentistService.getAllDentists(page, size, sortBy, sortDir);
        return ResponseEntity.ok(PaginatedResponse.of(
                dentistPage.getContent(),
                dentistPage.getNumber(),
                dentistPage.getTotalPages(),
                dentistPage.getTotalElements(),
                dentistPage.getSize()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DentistResponse>> getDentistById(@PathVariable Long id) {
        DentistResponse response = dentistService.getDentistById(id);
        return ResponseEntity.ok(ApiResponse.success("Dentist retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DentistResponse>> updateDentist(
            @PathVariable Long id,
            @Valid @RequestBody DentistRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        DentistResponse response = dentistService.updateDentist(id, request);
        auditService.logWithUser(userDetails.getUsername(), "UPDATE", "DENTIST",
                id, "Updated dentist: " + response.getDentistCode(),
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Dentist updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDentist(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        dentistService.deleteDentist(id);
        auditService.logWithUser(userDetails.getUsername(), "DELETE", "DENTIST",
                id, "Deactivated dentist", getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Dentist deactivated successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DentistResponse>>> getActiveDentists() {
        List<DentistResponse> response = dentistService.getActiveDentists();
        return ResponseEntity.ok(ApiResponse.success("Active dentists retrieved", response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
