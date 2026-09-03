package com.dentaflow.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientNumber(String patientNumber);

    boolean existsByPatientNumber(String patientNumber);

    boolean existsByEmail(String email);

    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(patient_number FROM 5) AS BIGINT)), 0) FROM patients", nativeQuery = true)
    Long getMaxPatientNumberSuffix();

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.patientNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.contactNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable);

    Page<Patient> findByIdIn(@Param("ids") List<Long> ids, Pageable pageable);
}
