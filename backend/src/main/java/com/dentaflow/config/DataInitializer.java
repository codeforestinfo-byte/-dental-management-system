package com.dentaflow.config;

import com.dentaflow.auth.Role;
import com.dentaflow.auth.RoleRepository;
import com.dentaflow.auth.User;
import com.dentaflow.auth.UserRepository;
import com.dentaflow.common.constants.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        createRoles();
        createAdminUser();
    }

    private void createRoles() {
        for (String roleName : new String[]{
                AppConstants.ROLE_ADMIN,
                AppConstants.ROLE_RECEPTIONIST,
                AppConstants.ROLE_DENTIST}) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().roleName(roleName).build());
                log.info("Created role: {}", roleName);
            }
        }
    }

    private void createAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            Role adminRole = roleRepository.findByRoleName(AppConstants.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));

            User admin = User.builder()
                    .username("admin")
                    .email("admin@sunrisedental.lk")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .enabled(true)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            log.info("Created admin user: admin / admin123");
        }
    }
}
