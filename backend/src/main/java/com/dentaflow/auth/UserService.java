package com.dentaflow.auth;

import com.dentaflow.audit.AuditService;
import com.dentaflow.auth.dto.*;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request, String adminUsername) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Set<Role> roles = resolveRoles(request.getRoles());

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .roles(roles)
                .build();

        user = userRepository.save(user);

        auditService.logWithUser(adminUsername, "CREATE", "USER", user.getId(),
                "Created user: " + user.getUsername() + " with roles: " + request.getRoles(), null);

        log.info("User created by admin {}: {}", adminUsername, user.getUsername());
        return toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (request.getEmail() != null) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getRoles() != null) {
            Set<Role> roles = resolveRoles(request.getRoles());
            user.setRoles(roles);
        }

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        user = userRepository.save(user);

        auditService.logWithUser(adminUsername, "UPDATE", "USER", user.getId(),
                "Updated user: " + user.getUsername(), null);

        log.info("User updated by admin {}: {}", adminUsername, user.getUsername());
        return toUserResponse(user);
    }

    @Transactional
    public void deleteUser(Long id, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (user.getRoles().stream().anyMatch(r -> r.getRoleName().equals(AppConstants.ROLE_ADMIN))) {
            boolean isAdminOnly = user.getRoles().size() == 1;
            if (isAdminOnly) {
                long adminCount = userRepository.findAll().stream()
                        .filter(u -> u.isEnabled() && u.getRoles().stream()
                                .anyMatch(r -> r.getRoleName().equals(AppConstants.ROLE_ADMIN)))
                        .count();
                if (adminCount <= 1) {
                    throw new BadRequestException("Cannot delete the last admin user");
                }
            }
        }

        user.setEnabled(false);
        userRepository.save(user);

        auditService.logWithUser(adminUsername, "DELETE", "USER", user.getId(),
                "Disabled user: " + user.getUsername(), null);

        log.info("User disabled by admin {}: {}", adminUsername, user.getUsername());
    }

    @Transactional
    public void resetPassword(Long id, String newPassword, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditService.logWithUser(adminUsername, "RESET_PASSWORD", "USER", user.getId(),
                "Password reset for user: " + user.getUsername(), null);

        log.info("Password reset by admin {} for user: {}", adminUsername, user.getUsername());
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByRoleName(roleName)
                    .orElseThrow(() -> new BadRequestException("Role not found: " + roleName));
            roles.add(role);
        }
        return roles;
    }

    private UserResponse toUserResponse(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toList());

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
