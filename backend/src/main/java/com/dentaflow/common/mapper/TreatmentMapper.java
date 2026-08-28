package com.dentaflow.common.mapper;

import com.dentaflow.treatment.Treatment;
import com.dentaflow.treatment.dto.TreatmentRequest;
import com.dentaflow.treatment.dto.TreatmentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentMapper {

    TreatmentResponse toResponse(Treatment treatment);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "treatmentCode", ignore = true)
    @Mapping(target = "estimatedDurationMinutes", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Treatment toEntity(TreatmentRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "treatmentCode", ignore = true)
    @Mapping(target = "estimatedDurationMinutes", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(TreatmentRequest request, @MappingTarget Treatment treatment);
}
