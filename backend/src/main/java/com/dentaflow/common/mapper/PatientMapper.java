package com.dentaflow.common.mapper;

import com.dentaflow.patient.Patient;
import com.dentaflow.patient.dto.PatientRequest;
import com.dentaflow.patient.dto.PatientResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    PatientResponse toResponse(Patient patient);

    Patient toEntity(PatientRequest request);

    void updateEntityFromRequest(PatientRequest request, @MappingTarget Patient patient);
}
