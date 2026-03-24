package com.plantcare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * JPA entity representing a monitored plant.
 *
 * <p>Each plant belongs to exactly one {@link User} (many-to-one).  The
 * {@code healthStatus} field is automatically recalculated whenever new
 * sensor data is ingested — see
 * {@link com.plantcare.service.SensorDataService#recordSensorData}.</p>
 *
 * <p><b>Original contribution:</b> the domain model encodes horticultural
 * knowledge (light requirements, watering frequency, auto-calculated next
 * watering date) so the API can proactively alert users before a plant
 * becomes stressed.</p>
 *
 * <p><b>Validation rationale:</b> Jakarta Bean Validation annotations are
 * used at the entity level as a defence-in-depth measure.  Even if a
 * request DTO is bypassed (e.g. via direct service calls in tests), the
 * entity constraints will still be enforced by Hibernate's pre-persist
 * validation.</p>
 */
@Entity
@Table(name = "plants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Plant name is required")
    @Size(min = 2, max = 100, message = "Plant name must be between 2 and 100 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Species is required")
    @Column(nullable = false)
    private String species;

    /** Physical location — e.g. "Living Room", "Garden", "Greenhouse". */
    private String location;

    @Min(value = 1, message = "Watering frequency must be at least 1 day")
    @Max(value = 90, message = "Watering frequency must not exceed 90 days")
    @Column(name = "watering_frequency_days")
    private Integer wateringFrequencyDays;

    @Column(name = "last_watered")
    private LocalDate lastWatered;

    /**
     * Computed as {@code lastWatered + wateringFrequencyDays}.  Updated
     * automatically when the plant is watered.
     */
    @Column(name = "next_watering")
    private LocalDate nextWatering;

    /**
     * Light requirement category.  Stored as a plain string rather than an
     * enum so that the API remains forward-compatible if new categories
     * (e.g. "VERY_HIGH") are added without a schema migration.
     */
    @Column(name = "light_requirement")
    private String lightRequirement;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    /**
     * Auto-calculated health status derived from the latest sensor reading.
     * Values: HEALTHY, NEEDS_ATTENTION, CRITICAL.
     */
    @Column(name = "health_status")
    private String healthStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Owning user — establishes the many-to-one relationship.
     * {@code LAZY} fetch is used to avoid loading the full User entity
     * every time a Plant is queried.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.healthStatus == null) {
            this.healthStatus = "HEALTHY";
        }
    }
}
