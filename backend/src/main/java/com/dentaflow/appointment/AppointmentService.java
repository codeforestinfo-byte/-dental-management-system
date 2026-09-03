package com.dentaflow.appointment;

import com.dentaflow.appointment.dto.AppointmentRequest;
import com.dentaflow.appointment.dto.AppointmentResponse;
import com.dentaflow.attendance.DentistAttendanceService;
import com.dentaflow.auth.User;
import com.dentaflow.auth.UserRepository;
import com.dentaflow.billing.BillRepository;
import com.dentaflow.billing.BillService;
import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.common.mapper.AppointmentMapper;
import com.dentaflow.common.util.NumberGenerator;
import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.DentistRepository;
import com.dentaflow.patient.Patient;
import com.dentaflow.patient.PatientRepository;
import com.dentaflow.treatment.Treatment;
import com.dentaflow.treatment.TreatmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DentistRepository dentistRepository;
    private final TreatmentRepository treatmentRepository;
    private final AppointmentMapper appointmentMapper;
    private final BillService billService;
    private final BillRepository billRepository;
    private final DentistAttendanceService attendanceService;
    private final UserRepository userRepository;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        Dentist dentist = dentistRepository.findById(request.getDentistId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", request.getDentistId()));

        Treatment treatment = treatmentRepository.findById(request.getTreatmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", request.getTreatmentId()));

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }

        if (request.getAppointmentDate().isEqual(LocalDate.now()) &&
                request.getAppointmentTime().isBefore(LocalTime.now())) {
            throw new BadRequestException("Appointment time cannot be in the past");
        }

        Optional<Appointment> conflict = appointmentRepository.findConflictingAppointment(
                request.getDentistId(), request.getAppointmentDate(), request.getAppointmentTime());
        if (conflict.isPresent()) {
            throw new BadRequestException("Dentist is already booked at this date and time");
        }

        if (attendanceService.isDentistAbsent(request.getDentistId(), request.getAppointmentDate())) {
            throw new BadRequestException(dentist.getDentistName() + " is marked absent on " + request.getAppointmentDate() + ". Cannot book appointment.");
        }

        Appointment appointment = Appointment.builder()
                .appointmentNumber(NumberGenerator.generateAppointmentNumber())
                .patient(patient)
                .dentist(dentist)
                .treatment(treatment)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .notes(request.getNotes())
                .patientAddress(request.getPatientAddress() != null ? request.getPatientAddress() : patient.getAddress())
                .patientContact(request.getPatientContact() != null ? request.getPatientContact() : patient.getContactNumber())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Created appointment: {}", savedAppointment.getAppointmentNumber());
        return appointmentMapper.toResponse(savedAppointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAllAppointments(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return appointmentRepository.findAll(pageable).map(appointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return appointmentMapper.toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        Dentist dentist = dentistRepository.findById(request.getDentistId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", request.getDentistId()));

        Treatment treatment = treatmentRepository.findById(request.getTreatmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Treatment", "id", request.getTreatmentId()));

        Optional<Appointment> conflict = appointmentRepository.findConflictingAppointment(
                request.getDentistId(), request.getAppointmentDate(), request.getAppointmentTime());
        if (conflict.isPresent() && !conflict.get().getId().equals(id)) {
            throw new BadRequestException("Dentist is already booked at this date and time");
        }

        if (attendanceService.isDentistAbsent(request.getDentistId(), request.getAppointmentDate())) {
            throw new BadRequestException(dentist.getDentistName() + " is marked absent on " + request.getAppointmentDate() + ". Cannot book appointment.");
        }

        appointment.setPatient(patient);
        appointment.setDentist(dentist);
        appointment.setTreatment(treatment);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setNotes(request.getNotes());
        appointment.setPatientAddress(request.getPatientAddress() != null ? request.getPatientAddress() : patient.getAddress());
        appointment.setPatientContact(request.getPatientContact() != null ? request.getPatientContact() : patient.getContactNumber());

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        log.info("Updated appointment: {}", updatedAppointment.getAppointmentNumber());
        return appointmentMapper.toResponse(updatedAppointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        log.info("Cancelled appointment: {}", appointment.getAppointmentNumber());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentByNumber(String appointmentNumber) {
        Appointment appointment = appointmentRepository.findByAppointmentNumber(appointmentNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "number", appointmentNumber));
        return appointmentMapper.toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        Appointment.AppointmentStatus newStatus;
        try {
            newStatus = Appointment.AppointmentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }

        appointment.setStatus(newStatus);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        log.info("Updated appointment {} status to {}", updatedAppointment.getAppointmentNumber(), status);

        if (newStatus == Appointment.AppointmentStatus.COMPLETED && !billRepository.existsByAppointmentId(id)) {
            try {
                billService.generateBill(id);
                log.info("Auto-generated bill for completed appointment: {}", updatedAppointment.getAppointmentNumber());
            } catch (Exception e) {
                log.error("Failed to auto-generate bill for appointment {}: {}", updatedAppointment.getAppointmentNumber(), e.getMessage());
            }
        }

        return appointmentMapper.toResponse(updatedAppointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDateOnly(date).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDentistAppointments(Long dentistId, LocalDate startDate, LocalDate endDate) {
        return appointmentRepository.findDentistAppointmentsBetweenDates(dentistId, startDate, endDate).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getMyAppointments(String username, int page, int size, String sortBy, String sortDir) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Dentist dentist = dentistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "user", user.getId()));

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return appointmentRepository.findByDentistId(dentist.getId(), pageable).map(appointmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointmentsByDate(String username, LocalDate date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Dentist dentist = dentistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "user", user.getId()));

        return appointmentRepository.findByDentistIdAndAppointmentDate(dentist.getId(), date).stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AppointmentResponse> getNextMyAppointment(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Dentist dentist = dentistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "user", user.getId()));

        Pageable pageable = PageRequest.of(0, 1);
        List<Appointment> nextAppointments = appointmentRepository.findNextScheduledAppointments(
                dentist.getId(), LocalDate.now(), LocalTime.now(), pageable);

        if (nextAppointments.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(appointmentMapper.toResponse(nextAppointments.get(0)));
    }

    @Transactional
    public AppointmentResponse scanPatientBarcode(String username, String barcode) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Dentist dentist = dentistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "user", user.getId()));

        Patient patient = patientRepository.findByPatientNumber(barcode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "barcode", barcode));

        Appointment appointment = appointmentRepository.findScheduledAppointmentForDentistAndPatient(
                dentist.getId(), patient.getId(), LocalDate.now())
                .orElseThrow(() -> new BadRequestException(
                        "No scheduled appointment found for patient " + patient.getFirstName() + " " + patient.getLastName() + " today"));

        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        log.info("Barcode scan: completed appointment {} for patient {}", updatedAppointment.getAppointmentNumber(), barcode);

        if (!billRepository.existsByAppointmentId(updatedAppointment.getId())) {
            try {
                billService.generateBill(updatedAppointment.getId());
                log.info("Auto-generated bill for scanned appointment: {}", updatedAppointment.getAppointmentNumber());
            } catch (Exception e) {
                log.error("Failed to auto-generate bill for appointment {}: {}", updatedAppointment.getAppointmentNumber(), e.getMessage());
            }
        }

        return appointmentMapper.toResponse(updatedAppointment);
    }
}
