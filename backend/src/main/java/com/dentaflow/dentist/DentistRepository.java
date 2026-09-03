package com.dentaflow.dentist;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DentistRepository extends JpaRepository<Dentist, Long> {

    Optional<Dentist> findByDentistCode(String dentistCode);

    boolean existsByDentistCode(String dentistCode);

    List<Dentist> findByActiveTrue();

    Optional<Dentist> findByUserId(Long userId);

    @Query("SELECT d FROM Dentist d WHERE d.active = true AND " +
           "LOWER(d.dentistName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Dentist> searchDentists(@Param("search") String search, Pageable pageable);
}
