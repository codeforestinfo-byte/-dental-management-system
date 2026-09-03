package com.dentaflow.auth;

import com.dentaflow.audit.AuditService;
import com.dentaflow.auth.dto.*;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.exception.UnauthorizedException;
import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.DentistRepository;
import com.dentaflow.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final DentistRepository dentistRepository;

    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", request.getUsername()));

        RefreshToken token = RefreshToken.builder()
                .token(refreshToken)
                .user(user)
                .expiryDate(LocalDateTime.now().plusNanos(tokenProvider.getRefreshTokenExpiration() * 1_000_000))
                .build();
        refreshTokenRepository.save(token);

        List<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toList());

        auditService.logWithUser(request.getUsername(), "LOGIN", "USER", user.getId(),
                "User logged in", getClientIp(httpRequest));

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpiration())
                .username(user.getUsername())
                .roles(roles)
                .build();
    }

    @Transactional
    public void logout(String username, HttpServletRequest httpRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        refreshTokenRepository.deleteByUserId(user.getId());

        auditService.logWithUser(username, "LOGOUT", "USER", user.getId(),
                "User logged out", getClientIp(httpRequest));
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Refresh token not found"));

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("Refresh token has expired");
        }

        String username = tokenProvider.getUsernameFromToken(request.getRefreshToken());

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        List<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toList());

        String newAccessToken = tokenProvider.generateAccessToken(username, roles);
        String newRefreshToken = tokenProvider.generateRefreshToken(username);

        refreshToken.setToken(newRefreshToken);
        refreshToken.setExpiryDate(LocalDateTime.now().plusNanos(tokenProvider.getRefreshTokenExpiration() * 1_000_000));
        refreshTokenRepository.save(refreshToken);

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpiration())
                .username(user.getUsername())
                .roles(roles)
                .build();
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.logWithUser(username, "CHANGE_PASSWORD", "USER", user.getId(),
                "Password changed", null);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        log.info("Password reset token for {}: {}", request.getEmail(), resetToken);
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByRoleName(roleName)
                        .orElseThrow(() -> new BadRequestException("Role not found: " + roleName));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByRoleName(AppConstants.ROLE_RECEPTIONIST)
                    .orElseThrow(() -> new BadRequestException("Default role not found"));
            roles.add(defaultRole);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .roles(roles)
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        List<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toList());

        Long dentistId = null;
        if (roles.contains("DENTIST")) {
            Optional<Dentist> dentist = dentistRepository.findByUserId(user.getId());
            if (dentist.isPresent()) {
                dentistId = dentist.get().getId();
            }
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .roles(roles)
                .dentistId(dentistId)
                .createdAt(user.getCreatedAt())
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
