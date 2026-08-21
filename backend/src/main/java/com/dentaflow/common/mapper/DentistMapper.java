package com.dentaflow.common.mapper;

import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.dto.DentistRequest;
import com.dentaflow.dentist.dto.DentistResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DentistMapper {

    DentistResponse toResponse(Dentist dentist);

    Dentist toEntity(DentistRequest request);

    void updateEntityFromRequest(DentistRequest request, @MappingTarget Dentist dentist);
}
