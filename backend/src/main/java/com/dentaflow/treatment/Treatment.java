package com.dentaflow.treatment;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "treatment_code", nullable = false, unique = true, length = 20)
    private String treatmentCode;

    @Column(name = "treatment_name", nullable = false, length = 100)
    private String treatmentName;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String category;

    @Column(name = "treatment_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal treatmentFee;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
