package com.plantcare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA entity for a single sensor reading associated with a {@link Plant}.
 *
 * <p>Sensor readings are append-only (immutable once persisted) which
 * simplifies auditing and makes the data suitable for time-series
 * analysis.  Ranges are enforced via Jakarta Validation annotations as
 * a defence-in-depth measure — the DTO layer performs the same checks
 * so invalid data is rejected before it reaches the persistence layer.</p>
 *
 * <p><b>Original contribution:</b> the health-status derivation logic
 * (see {@link com.plantcare.service.SensorDataService}) uses the
 * {@code soilMoisture} value from this entity to automatically classify
 * the parent plant's condition as HEALTHY, NEEDS_ATTENTION or CRITICAL,
 * enabling proactive alerting without manual inspection.</p>
 */
@Entity
@Table(name = "sensor_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Soil moisture percentage (0–100 %). */
    @DecimalMin(value = "0.0", message = "Soil moisture cannot be negative")
    @DecimalMax(value = "100.0", message = "Soil moisture cannot exceed 100%")
    @Column(name = "soil_moisture")
    private Double soilMoisture;

    /** Ambient temperature in degrees Celsius (-40 to 60 °C). */
    @DecimalMin(value = "-40.0", message = "Temperature cannot be below -40°C")
    @DecimalMax(value = "60.0", message = "Temperature cannot exceed 60°C")
    private Double temperature;

    /** Light level in lux (0–100 000 lx). */
    @DecimalMin(value = "0.0", message = "Light level cannot be negative")
    @DecimalMax(value = "100000.0", message = "Light level cannot exceed 100000 lux")
    @Column(name = "light_level")
    private Double lightLevel;

    /** Relative humidity percentage (0–100 %). */
    @DecimalMin(value = "0.0", message = "Humidity cannot be negative")
    @DecimalMax(value = "100.0", message = "Humidity cannot exceed 100%")
    private Double humidity;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    /** The plant this reading belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_id", nullable = false)
    private Plant plant;

    @PrePersist
    protected void onCreate() {
        if (this.recordedAt == null) {
            this.recordedAt = LocalDateTime.now();
        }
    }
}
