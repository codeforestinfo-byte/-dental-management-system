package com.dentaflow.treatment;

import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.treatment.dto.TreatmentRequest;
import com.dentaflow.treatment.dto.TreatmentResponse;
import com.dentaflow.common.mapper.TreatmentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TreatmentService {

    private final TreatmentRepository treatmentRepository;
    private final TreatmentMapper treatmentMapper;

    @Transactional
    public TreatmentResponse createTreatment(TreatmentRequest request) {
        Treatment treatment = treatmentMapper.toEntity(request);
        treatment.setTreatmentCode(generateTreatmentCode(request.getTreatmentName()));
        treatment.setActive(true);
        treatment.setCategory(request.getCategory());
        treatment.setEstimatedDurationMinutes(parseIntSafe(request.getEstimatedDurationMinutes()));

        Treatment savedTreatment = treatmentRepository.save(treatment);
        log.info("Created treatment: {}", savedTreatment.getTreatmentCode());
        return treatmentMapper.toResponse(savedTreatment);
    }

    @Transactional(readOnly = true)
    public Page<TreatmentResponse> getAllTreatments(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return treatmentRepository.findAll(pageable).map(treatmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TreatmentResponse getTreatmentById(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", id));
        return treatmentMapper.toResponse(treatment);
    }

    @Transactional
    public TreatmentResponse updateTreatment(Long id, TreatmentRequest request) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", id));

        treatment.setTreatmentName(request.getTreatmentName());
        treatment.setDescription(request.getDescription());
        treatment.setTreatmentFee(request.getTreatmentFee());
        treatment.setCategory(request.getCategory());
        treatment.setEstimatedDurationMinutes(parseIntSafe(request.getEstimatedDurationMinutes()));

        Treatment updatedTreatment = treatmentRepository.save(treatment);
        log.info("Updated treatment: {}", updatedTreatment.getTreatmentCode());
        return treatmentMapper.toResponse(updatedTreatment);
    }

    @Transactional
    public void deleteTreatment(Long id) {
        Treatment treatment = treatmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", id));
        treatment.setActive(false);
        treatmentRepository.save(treatment);
        log.info("Deactivated treatment: {}", treatment.getTreatmentCode());
    }

    @Transactional(readOnly = true)
    public List<TreatmentResponse> getActiveTreatments() {
        return treatmentRepository.findByActiveTrue().stream()
                .map(treatmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    private String generateTreatmentCode(String treatmentName) {
        String prefix = treatmentName.substring(0, Math.min(3, treatmentName.length())).toUpperCase();
        long timestamp = System.currentTimeMillis() % 10000;
        return String.format("TRT-%s-%04d", prefix, timestamp);
    }

    private Integer parseIntSafe(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
