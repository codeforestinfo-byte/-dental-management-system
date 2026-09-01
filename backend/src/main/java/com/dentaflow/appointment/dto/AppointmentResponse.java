package com.dentaflow.appointment.dto;

import com.dentaflow.appointment.Appointment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {

    private Long id;
    private String appointmentNumber;
    private Long patientId;
    private String patientName;
    private Long dentistId;
    private String dentistName;
    private Long treatmentId;
    private String treatmentName;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private Appointment.AppointmentStatus status;
    private String notes;
    private String patientAddress;
    private String patientContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
