package com.dentaflow.appointment;

import com.dentaflow.audit.AuditService;
import com.dentaflow.appointment.dto.AppointmentRequest;
import com.dentaflow.appointment.dto.AppointmentResponse;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.common.response.PaginatedResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AuditService auditService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        AppointmentResponse response = appointmentService.createAppointment(request);
        auditService.logWithUser(userDetails.getUsername(), "CREATE", "APPOINTMENT",
                response.getId(), "Created appointment: " + response.getAppointmentNumber(),
                getClientIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment created successfully", response));
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<AppointmentResponse>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        size = Math.min(size, AppConstants.MAX_PAGE_SIZE);
        Page<AppointmentResponse> appointmentPage = appointmentService.getAllAppointments(page, size, sortBy, sortDir);
        return ResponseEntity.ok(PaginatedResponse.of(
                appointmentPage.getContent(),
                appointmentPage.getNumber(),
                appointmentPage.getTotalPages(),
                appointmentPage.getTotalElements(),
                appointmentPage.getSize()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable Long id) {
        AppointmentResponse response = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        AppointmentResponse response = appointmentService.updateAppointment(id, request);
        auditService.logWithUser(userDetails.getUsername(), "UPDATE", "APPOINTMENT",
                id, "Updated appointment: " + response.getAppointmentNumber(),
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        appointmentService.deleteAppointment(id);
        auditService.logWithUser(userDetails.getUsername(), "CANCEL", "APPOINTMENT",
                id, "Cancelled appointment", getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully"));
    }

    @GetMapping("/number/{appointmentNumber}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentByNumber(
            @PathVariable String appointmentNumber) {
        AppointmentResponse response = appointmentService.getAppointmentByNumber(appointmentNumber);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {
        AppointmentResponse response = appointmentService.updateAppointmentStatus(id, status);
        auditService.logWithUser(userDetails.getUsername(), "UPDATE_STATUS", "APPOINTMENT",
                id, "Updated appointment status to: " + status,
                getClientIp(httpRequest));
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated", response));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentResponse> response = appointmentService.getAppointmentsByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", response));
    }

    @GetMapping("/dentist/{dentistId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDentistAppointments(
            @PathVariable Long dentistId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AppointmentResponse> response = appointmentService.getDentistAppointments(dentistId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Dentist appointments retrieved", response));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
