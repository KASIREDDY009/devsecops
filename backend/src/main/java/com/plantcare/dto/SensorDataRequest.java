package com.plantcare.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for submitting a new sensor reading.
 *
 * <p>Range constraints mirror the physical limits of the sensors used
 * in the plant-monitoring hardware kit.  Values outside these ranges
 * indicate a malfunctioning sensor and should be rejected.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorDataRequest {

    @NotNull(message = "Plant ID is required")
    private Long plantId;

    @DecimalMin(value = "0.0", message = "Soil moisture cannot be negative")
    @DecimalMax(value = "100.0", message = "Soil moisture cannot exceed 100%")
    private Double soilMoisture;

    @DecimalMin(value = "-40.0", message = "Temperature cannot be below -40°C")
    @DecimalMax(value = "60.0", message = "Temperature cannot exceed 60°C")
    private Double temperature;

    @DecimalMin(value = "0.0", message = "Light level cannot be negative")
    @DecimalMax(value = "100000.0", message = "Light level cannot exceed 100000 lux")
    private Double lightLevel;

    @DecimalMin(value = "0.0", message = "Humidity cannot be negative")
    @DecimalMax(value = "100.0", message = "Humidity cannot exceed 100%")
    private Double humidity;
}
