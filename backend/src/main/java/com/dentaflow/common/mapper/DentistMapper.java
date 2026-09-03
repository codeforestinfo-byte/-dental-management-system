package com.dentaflow.common.mapper;

import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.dto.DentistRequest;
import com.dentaflow.dentist.dto.DentistResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;
import java.time.LocalDate;

@Mapper(componentModel = "spring")
public interface DentistMapper {

    @Mapping(target = "userId", expression = "java(dentist.getUser() != null ? dentist.getUser().getId() : null)")
    DentistResponse toResponse(Dentist dentist);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dentistCode", ignore = true)
    @Mapping(target = "dateOfBirth", ignore = true)
    @Mapping(target = "licenseExpiryDate", ignore = true)
    @Mapping(target = "joiningDate", ignore = true)
    @Mapping(target = "profilePhotoUrl", ignore = true)
    @Mapping(target = "resumeUrl", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Dentist toEntity(DentistRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dentistCode", ignore = true)
    @Mapping(target = "dateOfBirth", ignore = true)
    @Mapping(target = "licenseExpiryDate", ignore = true)
    @Mapping(target = "joiningDate", ignore = true)
    @Mapping(target = "profilePhotoUrl", ignore = true)
    @Mapping(target = "resumeUrl", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(DentistRequest request, @MappingTarget Dentist dentist);

    default LocalDate parseLocalDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    default Integer parseInteger(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception e) {
            return null;
        }
    }

    default BigDecimal parseBigDecimal(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return new BigDecimal(value.trim());
        } catch (Exception e) {
            return null;
        }
    }

    default String mapLocalDateToString(LocalDate value) {
        if (value == null) return null;
        return value.toString();
    }
}
