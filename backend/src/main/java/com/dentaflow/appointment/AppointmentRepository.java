package com.dentaflow.appointment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);

    boolean existsByAppointmentNumber(String appointmentNumber);

    @Query("SELECT a FROM Appointment a WHERE a.dentist.id = :dentistId AND " +
           "a.appointmentDate = :date AND a.appointmentTime = :time AND " +
           "a.status <> 'CANCELLED'")
    Optional<Appointment> findConflictingAppointment(
            @Param("dentistId") Long dentistId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time);

    @Query("SELECT a FROM Appointment a WHERE a.dentist.id = :dentistId AND " +
           "a.appointmentDate = :date AND a.status <> 'CANCELLED'")
    List<Appointment> findAppointmentsByDentistAndDate(
            @Param("dentistId") Long dentistId,
            @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId")
    Page<Appointment> findByPatientId(@Param("patientId") Long patientId, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date")
    Page<Appointment> findByAppointmentDate(@Param("date") LocalDate date, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate = :date")
    List<Appointment> findByAppointmentDateOnly(@Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.status = :status")
    Page<Appointment> findByStatus(@Param("status") Appointment.AppointmentStatus status, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findAppointmentsBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Appointment a WHERE a.dentist.id = :dentistId AND " +
           "a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findDentistAppointmentsBetweenDates(
            @Param("dentistId") Long dentistId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countByAppointmentDateAndStatus(LocalDate date, Appointment.AppointmentStatus status);

    long countByStatus(Appointment.AppointmentStatus status);
}
