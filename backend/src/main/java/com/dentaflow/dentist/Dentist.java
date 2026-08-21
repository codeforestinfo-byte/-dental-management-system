package com.dentaflow.dentist;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "dentists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dentist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dentist_code", nullable = false, unique = true, length = 20)
    private String dentistCode;

    @Column(name = "dentist_name", nullable = false, length = 100)
    private String dentistName;

    @Column(length = 100)
    private String specialization;

    @Column(name = "contact_number", length = 20)
    private String contactNumber;

    @Column(length = 100)
    private String email;

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
