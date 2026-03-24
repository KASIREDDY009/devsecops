package com.plantcare.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating or updating a plant.
 *
 * <p>Input validation is enforced here at the API boundary so that
 * invalid data is rejected with a clear 400 response before it
 * reaches the service or persistence layers.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlantRequest {

    @NotBlank(message = "Plant name is required")
    @Size(min = 2, max = 100, message = "Plant name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Species is required")
    private String species;

    private String location;

    @Min(value = 1, message = "Watering frequency must be at least 1 day")
    @Max(value = 90, message = "Watering frequency must not exceed 90 days")
    private Integer wateringFrequencyDays;

    private LocalDate lastWatered;

    /** Accepted values: LOW, MEDIUM, HIGH. */
    private String lightRequirement;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
