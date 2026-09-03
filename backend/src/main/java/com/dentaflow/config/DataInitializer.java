package com.dentaflow.config;

import com.dentaflow.appointment.Appointment;
import com.dentaflow.appointment.AppointmentRepository;
import com.dentaflow.auth.Role;
import com.dentaflow.auth.RoleRepository;
import com.dentaflow.auth.User;
import com.dentaflow.auth.UserRepository;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.util.NumberGenerator;
import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.DentistRepository;
import com.dentaflow.patient.Patient;
import com.dentaflow.patient.PatientRepository;
import com.dentaflow.treatment.Treatment;
import com.dentaflow.treatment.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final DentistRepository dentistRepository;
    private final TreatmentRepository treatmentRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        createRoles();
        createAdminUser();
        createSampleTreatments();
        createSampleDentists();
        createSamplePatients();
        createSampleAppointments();
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

    private void createSampleTreatments() {
        if (treatmentRepository.count() > 0) return;

        Object[][] treatments = {
                {"TR001", "General Checkup", "Routine dental examination and cleaning", "General", 2500.00, 30},
                {"TR002", "Teeth Cleaning", "Professional dental cleaning and polishing", "Hygiene", 3500.00, 45},
                {"TR003", "Dental Filling", "Composite or amalgam tooth filling", "Restorative", 5000.00, 45},
                {"TR004", "Root Canal Treatment", "Endodontic treatment for infected tooth", "Endodontic", 15000.00, 90},
                {"TR005", "Tooth Extraction", "Simple tooth extraction", "Surgical", 7500.00, 30},
                {"TR006", "Dental Crown", "Porcelain or metal crown placement", "Prosthodontic", 20000.00, 60},
                {"TR007", "Teeth Whitening", "Professional teeth whitening treatment", "Cosmetic", 12000.00, 60},
                {"TR008", "Dental Bridge", "Fixed bridge to replace missing teeth", "Prosthodontic", 25000.00, 90},
                {"TR009", "Wisdom Tooth Removal", "Surgical removal of wisdom teeth", "Surgical", 18000.00, 60},
                {"TR010", "Orthodontic Consultation", "Initial orthodontic assessment", "Orthodontic", 5000.00, 30},
        };

        for (Object[] t : treatments) {
            Treatment treatment = Treatment.builder()
                    .treatmentCode((String) t[0])
                    .treatmentName((String) t[1])
                    .description((String) t[2])
                    .category((String) t[3])
                    .treatmentFee(new BigDecimal(((Number) t[4]).toString()))
                    .estimatedDurationMinutes((Integer) t[5])
                    .active(true)
                    .build();
            treatmentRepository.save(treatment);
        }
        log.info("Created {} sample treatments", treatments.length);
    }

    private void createSampleDentists() {
        if (dentistRepository.count() > 0) return;

        Role dentistRole = roleRepository.findByRoleName(AppConstants.ROLE_DENTIST)
                .orElseThrow(() -> new RuntimeException("DENTIST role not found"));

        Object[][] dentists = {
                {"Dr. Amara Perera", "FEMALE", "123456789V", "SLMC-001", "General Dentistry", "BDS", 8, "1000.00"},
                {"Dr. Dilshan Fernando", "MALE", "987654321V", "SLMC-002", "Orthodontics", "BDS, MOrth", 12, "1500.00"},
                {"Dr. Nisha Rajapaksa", "FEMALE", "567891234V", "SLMC-003", "Endodontics", "BDS, MEnd", 6, "1200.00"},
        };

        for (int i = 0; i < dentists.length; i++) {
            Object[] d = dentists[i];
            String username = "dentist" + (i + 1);

            User user = User.builder()
                    .username(username)
                    .email(username + "@sunrisedental.lk")
                    .passwordHash(passwordEncoder.encode("dentist123"))
                    .enabled(true)
                    .roles(Set.of(dentistRole))
                    .build();
            user = userRepository.save(user);

            Dentist dentist = Dentist.builder()
                    .dentistCode(NumberGenerator.generateDentistCode((String) d[0]))
                    .dentistName((String) d[0])
                    .gender((String) d[1])
                    .nicNumber((String) d[2])
                    .slmcRegistrationNumber((String) d[3])
                    .specialization((String) d[4])
                    .qualification((String) d[5])
                    .yearsOfExperience((Integer) d[6])
                    .consultationFee(new BigDecimal((String) d[7]))
                    .contactNumber("077123456" + (i + 1))
                    .email(username + "@sunrisedental.lk")
                    .employmentType("FULL_TIME")
                    .department("Dental")
                    .status("ACTIVE")
                    .availableDays("MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY")
                    .user(user)
                    .active(true)
                    .build();
            dentistRepository.save(dentist);
        }
        log.info("Created {} sample dentists", dentists.length);
    }

    private void createSamplePatients() {
        if (patientRepository.count() > 0) return;

        Object[][] patients = {
                {"PAT-000001", "Kasun", "Silva", "123 Galle Road, Colombo", "0771111111", "kasun@email.com", "1990-05-15", "MALE"},
                {"PAT-000002", "Nipuni", "Jayawardena", "45 Kandy Road, Kandy", "0772222222", "nipuni@email.com", "1985-08-22", "FEMALE"},
                {"PAT-000003", "Tharaka", "Wijesinghe", "78 Galle Face, Colombo", "0773333333", "tharaka@email.com", "1992-12-10", "MALE"},
                {"PAT-000004", "Amasha", "Fernando", "23 Matara Road, Galle", "0774444444", "amasha@email.com", "1988-03-18", "FEMALE"},
                {"PAT-000005", "Ruwan", "Bandara", "56 Negombo Road, Ja-Ela", "0775555555", "ruwan@email.com", "1995-07-25", "MALE"},
        };

        for (Object[] p : patients) {
            Patient patient = Patient.builder()
                    .patientNumber((String) p[0])
                    .firstName((String) p[1])
                    .lastName((String) p[2])
                    .address((String) p[3])
                    .contactNumber((String) p[4])
                    .email((String) p[5])
                    .dateOfBirth(LocalDate.parse((String) p[6]))
                    .gender(Patient.Gender.valueOf((String) p[7]))
                    .registrationDate(LocalDate.now().minusDays(30))
                    .status("Active")
                    .consentAccepted(true)
                    .build();
            patientRepository.save(patient);
        }
        log.info("Created {} sample patients", patients.length);
    }

    private void createSampleAppointments() {
        if (appointmentRepository.count() > 0) return;
        if (patientRepository.count() == 0 || dentistRepository.count() == 0 || treatmentRepository.count() == 0) return;

        var patients = patientRepository.findAll();
        var dentists = dentistRepository.findAll();
        var treatments = treatmentRepository.findAll();

        if (patients.isEmpty() || dentists.isEmpty() || treatments.isEmpty()) return;

        Object[][] appointments = {
                {0, 0, 0, "2025-07-10", "09:00:00", "COMPLETED", "Routine checkup"},
                {1, 0, 1, "2025-07-12", "10:00:00", "COMPLETED", "Teeth cleaning session"},
                {2, 1, 2, "2025-07-14", "11:00:00", "COMPLETED", "Filling for cavity"},
                {0, 1, 3, "2025-07-15", "09:30:00", "SCHEDULED", "Root canal follow-up"},
                {3, 0, 4, "2025-07-16", "14:00:00", "SCHEDULED", "Tooth extraction"},
                {4, 2, 0, "2025-07-17", "10:30:00", "SCHEDULED", "Regular checkup"},
        };

        for (Object[] a : appointments) {
            int patientIdx = Math.min((int) a[0], patients.size() - 1);
            int dentistIdx = Math.min((int) a[1], dentists.size() - 1);
            int treatmentIdx = Math.min((int) a[2], treatments.size() - 1);

            Appointment appointment = Appointment.builder()
                    .appointmentNumber(NumberGenerator.generateAppointmentNumber())
                    .patient(patients.get(patientIdx))
                    .dentist(dentists.get(dentistIdx))
                    .treatment(treatments.get(treatmentIdx))
                    .appointmentDate(LocalDate.parse((String) a[3]))
                    .appointmentTime(LocalTime.parse((String) a[4]))
                    .status(Appointment.AppointmentStatus.valueOf((String) a[5]))
                    .notes((String) a[6])
                    .patientAddress(patients.get(patientIdx).getAddress())
                    .patientContact(patients.get(patientIdx).getContactNumber())
                    .build();
            appointmentRepository.save(appointment);
        }
        log.info("Created {} sample appointments", appointments.length);
    }
}
