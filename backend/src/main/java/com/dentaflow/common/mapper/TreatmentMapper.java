package com.dentaflow.common.mapper;

import com.dentaflow.treatment.Treatment;
import com.dentaflow.treatment.dto.TreatmentRequest;
import com.dentaflow.treatment.dto.TreatmentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TreatmentMapper {

    TreatmentResponse toResponse(Treatment treatment);

    Treatment toEntity(TreatmentRequest request);

    void updateEntityFromRequest(TreatmentRequest request, @MappingTarget Treatment treatment);
}
