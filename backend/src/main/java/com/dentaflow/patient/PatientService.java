package com.dentaflow.patient;

import com.dentaflow.appointment.AppointmentRepository;
import com.dentaflow.auth.User;
import com.dentaflow.auth.UserRepository;
import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.util.NumberGenerator;
import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.DentistRepository;
import com.dentaflow.patient.dto.PatientRequest;
import com.dentaflow.patient.dto.PatientResponse;
import com.dentaflow.common.mapper.PatientMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    private final UserRepository userRepository;
    private final DentistRepository dentistRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        Patient patient = patientMapper.toEntity(request);

        Long maxSuffix = patientRepository.getMaxPatientNumberSuffix();
        String patientNumber = String.format("PAT-%06d", maxSuffix + 1);
        patient.setPatientNumber(patientNumber);

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && patientRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        if (patient.getRegistrationDate() == null) {
            patient.setRegistrationDate(LocalDate.now());
        }
        if (patient.getStatus() == null) {
            patient.setStatus("ACTIVE");
        }
        if (patient.getHasDiabetes() == null) patient.setHasDiabetes(false);
        if (patient.getHasHypertension() == null) patient.setHasHypertension(false);
        if (patient.getHasHeartDisease() == null) patient.setHasHeartDisease(false);
        if (patient.getHasAsthma() == null) patient.setHasAsthma(false);
        if (patient.getHasEpilepsy() == null) patient.setHasEpilepsy(false);
        if (patient.getHasBleedingDisorders() == null) patient.setHasBleedingDisorders(false);
        if (patient.getConsentAccepted() == null) patient.setConsentAccepted(false);

        Patient savedPatient = patientRepository.save(patient);
        log.info("Created patient: {}", savedPatient.getPatientNumber());
        return patientMapper.toResponse(savedPatient);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> getAllPatients(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return patientRepository.findAll(pageable).map(patientMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return patientMapper.toResponse(patient);
    }

    @Transactional
    public PatientResponse updatePatient(Long id, PatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        patientMapper.updateEntityFromRequest(request, patient);
        Patient updatedPatient = patientRepository.save(patient);
        log.info("Updated patient: {}", updatedPatient.getPatientNumber());
        return patientMapper.toResponse(updatedPatient);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        patientRepository.delete(patient);
        log.info("Deleted patient: {}", patient.getPatientNumber());
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> searchPatients(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        return patientRepository.searchPatients(search, pageable).map(patientMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByNumber(String patientNumber) {
        Patient patient = patientRepository.findByPatientNumber(patientNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientNumber", patientNumber));
        return patientMapper.toResponse(patient);
    }

    @Transactional(readOnly = true)
    public Page<PatientResponse> getMyPatients(String username, int page, int size, String sortBy, String sortDir) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Dentist dentist = dentistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "user", user.getId()));

        List<Long> patientIds = appointmentRepository.findDistinctPatientIdsByDentistId(dentist.getId());

        if (patientIds.isEmpty()) {
            return Page.empty(PageRequest.of(page, size));
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return patientRepository.findByIdIn(patientIds, pageable).map(patientMapper::toResponse);
    }
}
