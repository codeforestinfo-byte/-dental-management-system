package com.dentaflow.patient;

import com.dentaflow.common.constants.AppConstants;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.util.NumberGenerator;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Transactional
    public PatientResponse createPatient(PatientRequest request) {
        Patient patient = patientMapper.toEntity(request);
        patient.setPatientNumber(NumberGenerator.generatePatientNumber());

        if (request.getEmail() != null && patientRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

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
}
