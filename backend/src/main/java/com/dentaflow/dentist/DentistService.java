package com.dentaflow.dentist;

import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.util.NumberGenerator;
import com.dentaflow.dentist.dto.DentistRequest;
import com.dentaflow.dentist.dto.DentistResponse;
import com.dentaflow.common.mapper.DentistMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DentistService {

    private final DentistRepository dentistRepository;
    private final DentistMapper dentistMapper;

    @Value("${app.upload.dentist-dir:uploads/dentists}")
    private String uploadBaseDir;

    @Transactional
    public DentistResponse createDentist(DentistRequest request) {
        Dentist dentist = dentistMapper.toEntity(request);
        dentist.setDentistCode(NumberGenerator.generateDentistCode(request.getDentistName()));
        dentist.setActive(true);

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            dentist.setStatus(request.getStatus());
        } else {
            dentist.setStatus("ACTIVE");
        }

        dentist.setDateOfBirth(parseLocalDate(request.getDateOfBirth()));
        dentist.setLicenseExpiryDate(parseLocalDate(request.getLicenseExpiryDate()));
        dentist.setJoiningDate(parseLocalDate(request.getJoiningDate()));
        dentist.setYearsOfExperience(parseIntSafe(request.getYearsOfExperience()));
        dentist.setConsultationFee(parseBigDecimalSafe(request.getConsultationFee()));
        dentist.setFollowupFee(parseBigDecimalSafe(request.getFollowupFee()));

        Dentist savedDentist = dentistRepository.save(dentist);
        log.info("Created dentist: {}", savedDentist.getDentistCode());
        return dentistMapper.toResponse(savedDentist);
    }

    @Transactional(readOnly = true)
    public Page<DentistResponse> getAllDentists(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return dentistRepository.findAll(pageable).map(dentistMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DentistResponse getDentistById(Long id) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", id));
        return dentistMapper.toResponse(dentist);
    }

    @Transactional
    public DentistResponse updateDentist(Long id, DentistRequest request) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", id));

        dentist.setDentistName(request.getDentistName());
        dentist.setGender(request.getGender());
        dentist.setNicNumber(request.getNicNumber());
        dentist.setSlmcRegistrationNumber(request.getSlmcRegistrationNumber());
        dentist.setSpecialization(request.getSpecialization());
        dentist.setQualification(request.getQualification());
        dentist.setContactNumber(request.getContactNumber());
        dentist.setSecondaryPhone(request.getSecondaryPhone());
        dentist.setEmail(request.getEmail());
        dentist.setAddress(request.getAddress());
        dentist.setEmploymentType(request.getEmploymentType());
        dentist.setDepartment(request.getDepartment());
        dentist.setAvailableDays(request.getAvailableDays());

        dentist.setDateOfBirth(parseLocalDate(request.getDateOfBirth()));
        dentist.setLicenseExpiryDate(parseLocalDate(request.getLicenseExpiryDate()));
        dentist.setJoiningDate(parseLocalDate(request.getJoiningDate()));
        dentist.setYearsOfExperience(parseIntSafe(request.getYearsOfExperience()));
        dentist.setConsultationFee(parseBigDecimalSafe(request.getConsultationFee()));
        dentist.setFollowupFee(parseBigDecimalSafe(request.getFollowupFee()));

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            dentist.setStatus(request.getStatus());
        }

        Dentist updatedDentist = dentistRepository.save(dentist);
        log.info("Updated dentist: {}", updatedDentist.getDentistCode());
        return dentistMapper.toResponse(updatedDentist);
    }

    @Transactional
    public void deleteDentist(Long id) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", id));
        dentist.setActive(false);
        dentist.setStatus("INACTIVE");
        dentistRepository.save(dentist);
        log.info("Deactivated dentist: {}", dentist.getDentistCode());
    }

    @Transactional(readOnly = true)
    public List<DentistResponse> getActiveDentists() {
        return dentistRepository.findByActiveTrue().stream()
                .map(dentistMapper::toResponse)
                .collect(Collectors.toList());
    }

    public String saveProfilePhoto(Long dentistId, MultipartFile file) {
        Dentist dentist = dentistRepository.findById(dentistId)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", dentistId));

        String filename = "profile" + getExtension(file.getOriginalFilename());
        Path dir = getDentistDir(dentistId);
        Path filepath = dir.resolve(filename);

        try {
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Failed to save profile photo: " + e.getMessage());
        }

        String url = "/uploads/dentists/" + dentistId + "/" + filename;
        dentist.setProfilePhotoUrl(url);
        dentistRepository.save(dentist);
        log.info("Saved profile photo for dentist {}: {}", dentistId, url);
        return url;
    }

    public String saveResume(Long dentistId, MultipartFile file) {
        Dentist dentist = dentistRepository.findById(dentistId)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", dentistId));

        String filename = "resume_" + UUID.randomUUID().toString().substring(0, 8) + getExtension(file.getOriginalFilename());
        Path dir = getDentistDir(dentistId);
        Path filepath = dir.resolve(filename);

        try {
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Failed to save resume: " + e.getMessage());
        }

        String url = "/uploads/dentists/" + dentistId + "/" + filename;
        dentist.setResumeUrl(url);
        dentistRepository.save(dentist);
        log.info("Saved resume for dentist {}: {}", dentistId, url);
        return url;
    }

    private Path getDentistDir(Long dentistId) {
        return Paths.get(uploadBaseDir, String.valueOf(dentistId));
    }

    private String getExtension(String filename) {
        if (filename == null) return ".bin";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".bin";
    }

    private LocalDate parseLocalDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value.trim());
        } catch (Exception e) {
            log.warn("Failed to parse date: {}", value);
            return null;
        }
    }

    private Integer parseIntSafe(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception e) {
            log.warn("Failed to parse integer: {}", value);
            return null;
        }
    }

    private BigDecimal parseBigDecimalSafe(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return new BigDecimal(value.trim());
        } catch (Exception e) {
            log.warn("Failed to parse decimal: {}", value);
            return null;
        }
    }
}
