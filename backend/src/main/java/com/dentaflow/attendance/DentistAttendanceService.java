package com.dentaflow.attendance;

import com.dentaflow.common.exception.BadRequestException;
import com.dentaflow.common.exception.ResourceNotFoundException;
import com.dentaflow.dentist.Dentist;
import com.dentaflow.dentist.DentistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DentistAttendanceService {

    private final DentistAttendanceRepository attendanceRepository;
    private final DentistRepository dentistRepository;

    @Transactional
    public DentistAttendance markAttendance(Long dentistId, LocalDate date, String status, String notes) {
        Dentist dentist = dentistRepository.findById(dentistId)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", dentistId));

        if (!status.equalsIgnoreCase("PRESENT") && !status.equalsIgnoreCase("ABSENT") && !status.equalsIgnoreCase("HALF_DAY")) {
            throw new BadRequestException("Invalid status. Must be PRESENT, ABSENT, or HALF_DAY");
        }

        DentistAttendance existing = attendanceRepository.findByDentistAndAttendanceDate(dentist, date).orElse(null);

        if (existing != null) {
            existing.setStatus(status.toUpperCase());
            existing.setNotes(notes);
            DentistAttendance saved = attendanceRepository.save(existing);
            log.info("Updated attendance for dentist {} on {}: {}", dentistId, date, status);
            return saved;
        }

        DentistAttendance attendance = DentistAttendance.builder()
                .dentist(dentist)
                .attendanceDate(date)
                .status(status.toUpperCase())
                .notes(notes)
                .build();

        DentistAttendance saved = attendanceRepository.save(attendance);
        log.info("Marked attendance for dentist {} on {}: {}", dentistId, date, status);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<DentistAttendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    @Transactional(readOnly = true)
    public DentistAttendance getDentistAttendance(Long dentistId, LocalDate date) {
        Dentist dentist = dentistRepository.findById(dentistId)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", dentistId));
        return attendanceRepository.findByDentistAndAttendanceDate(dentist, date).orElse(null);
    }

    @Transactional(readOnly = true)
    public Map<Long, String> getAttendanceMapByDate(LocalDate date) {
        List<DentistAttendance> records = attendanceRepository.findByAttendanceDate(date);
        return records.stream()
                .collect(Collectors.toMap(
                        r -> r.getDentist().getId(),
                        DentistAttendance::getStatus
                ));
    }

    @Transactional
    public void deleteAttendance(Long attendanceId) {
        DentistAttendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", attendanceId));
        attendanceRepository.delete(attendance);
        log.info("Deleted attendance record: {}", attendanceId);
    }

    public boolean isDentistAbsent(Long dentistId, LocalDate date) {
        Dentist dentist = dentistRepository.findById(dentistId)
                .orElseThrow(() -> new ResourceNotFoundException("Dentist", "id", dentistId));
        return attendanceRepository.existsByDentistAndAttendanceDateAndStatus(dentist, date, "ABSENT");
    }
}
