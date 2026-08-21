package com.dentaflow.treatment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, Long> {

    Optional<Treatment> findByTreatmentCode(String treatmentCode);

    boolean existsByTreatmentCode(String treatmentCode);

    List<Treatment> findByActiveTrue();

    @Query("SELECT t FROM Treatment t WHERE " +
           "LOWER(t.treatmentName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.treatmentCode) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Treatment> searchTreatments(@Param("search") String search, Pageable pageable);
}
