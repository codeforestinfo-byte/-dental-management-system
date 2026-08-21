package com.dentaflow.common.mapper;

import com.dentaflow.appointment.Appointment;
import com.dentaflow.appointment.dto.AppointmentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(source = "patient.id", target = "patientId")
    @Mapping(expression = "java(appointment.getPatient().getFirstName() + \" \" + appointment.getPatient().getLastName())", target = "patientName")
    @Mapping(source = "dentist.id", target = "dentistId")
    @Mapping(source = "dentist.dentistName", target = "dentistName")
    @Mapping(source = "treatment.id", target = "treatmentId")
    @Mapping(source = "treatment.treatmentName", target = "treatmentName")
    AppointmentResponse toResponse(Appointment appointment);
}
