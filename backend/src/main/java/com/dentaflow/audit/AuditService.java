package com.dentaflow.audit;

import com.dentaflow.auth.User;
import com.dentaflow.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Async
    @Transactional
    public void log(String action, String entity, Long entityId, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .entity(entity)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void logWithUser(String username, String action, String entity, Long entityId, String details, String ipAddress) {
        try {
            User user = userRepository.findByUsername(username).orElse(null);
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entity(entity)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }
}
