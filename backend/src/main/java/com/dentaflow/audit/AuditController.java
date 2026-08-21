package com.dentaflow.audit;

import com.dentaflow.common.response.ApiResponse;
import com.dentaflow.common.response.PaginatedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<PaginatedResponse<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> auditPage = auditLogRepository.findAll(
                org.springframework.data.domain.PageRequest.of(page, size,
                        org.springframework.data.domain.Sort.by("createdAt").descending()));
        return ResponseEntity.ok(PaginatedResponse.of(
                auditPage.getContent(),
                auditPage.getNumber(),
                auditPage.getTotalPages(),
                auditPage.getTotalElements(),
                auditPage.getSize()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PaginatedResponse<AuditLog>> getAuditLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> auditPage = auditLogRepository.findByUserId(userId,
                org.springframework.data.domain.PageRequest.of(page, size));
        return ResponseEntity.ok(PaginatedResponse.of(
                auditPage.getContent(),
                auditPage.getNumber(),
                auditPage.getTotalPages(),
                auditPage.getTotalElements(),
                auditPage.getSize()));
    }
}
