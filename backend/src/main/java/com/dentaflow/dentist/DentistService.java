package com.dentaflow.dentist;

import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.util.NumberGenerator;
import com.dentaflow.dentist.dto.DentistRequest;
import com.dentaflow.dentist.dto.DentistResponse;
import com.dentaflow.common.mapper.DentistMapper;
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
public class DentistService {

    private final DentistRepository dentistRepository;
    private final DentistMapper dentistMapper;

    @Transactional
    public DentistResponse createDentist(DentistRequest request) {
        Dentist dentist = dentistMapper.toEntity(request);
        dentist.setDentistCode(NumberGenerator.generateDentistCode(request.getDentistName()));
        dentist.setActive(true);

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

        dentistMapper.updateEntityFromRequest(request, dentist);
        Dentist updatedDentist = dentistRepository.save(dentist);
        log.info("Updated dentist: {}", updatedDentist.getDentistCode());
        return dentistMapper.toResponse(updatedDentist);
    }

    @Transactional
    public void deleteDentist(Long id) {
        Dentist dentist = dentistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", id));
        dentist.setActive(false);
        dentistRepository.save(dentist);
        log.info("Deactivated dentist: {}", dentist.getDentistCode());
    }

    @Transactional(readOnly = true)
    public List<DentistResponse> getActiveDentists() {
        return dentistRepository.findByActiveTrue().stream()
                .map(dentistMapper::toResponse)
                .collect(Collectors.toList());
    }
}
