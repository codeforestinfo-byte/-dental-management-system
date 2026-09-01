package com.dentaflow.attendance;

import com.dentaflow.dentist.Dentist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DentistAttendanceRepository extends JpaRepository<DentistAttendance, Long> {

    @EntityGraph(attributePaths = {"dentist"})
    List<DentistAttendance> findByAttendanceDate(LocalDate date);

    @EntityGraph(attributePaths = {"dentist"})
    Optional<DentistAttendance> findByDentistAndAttendanceDate(Dentist dentist, LocalDate date);

    List<DentistAttendance> findByDentistIdAndAttendanceDateBetween(Long dentistId, LocalDate startDate, LocalDate endDate);

    boolean existsByDentistAndAttendanceDateAndStatus(Dentist dentist, LocalDate date, String status);

    void deleteByDentistIdAndAttendanceDate(Long dentistId, LocalDate date);
}
