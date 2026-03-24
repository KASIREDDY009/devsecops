package com.plantcare.service;

import com.plantcare.dto.PlantRequest;
import com.plantcare.exception.ResourceNotFoundException;
import com.plantcare.model.Plant;
import com.plantcare.model.User;
import com.plantcare.repository.PlantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for plant CRUD operations.
 *
 * <p>All operations are scoped to the authenticated user — the user ID
 * is passed in from the controller after being extracted from the JWT.
 * This ensures that a user can never access or modify another user's
 * plants, even by guessing a valid plant ID (defence against IDOR —
 * Insecure Direct Object Reference).</p>
 *
 * <p><b>Original contribution:</b> automatic next-watering-date
 * calculation based on the watering frequency and last-watered date,
 * enabling the frontend to display proactive care reminders.</p>
 */
@Service
public class PlantService {

    private static final Logger logger = LoggerFactory.getLogger(PlantService.class);

    private final PlantRepository plantRepository;

    public PlantService(PlantRepository plantRepository) {
        this.plantRepository = plantRepository;
    }

    /**
     * Retrieve all plants belonging to the given user.
     *
     * @param userId the authenticated user's ID
     * @return list of plants (may be empty)
     */
    public List<Plant> getAllPlantsByUser(Long userId) {
        logger.info("Fetching all plants for user ID: {}", userId);
        return plantRepository.findByUserId(userId);
    }

    /**
     * Retrieve a single plant by ID, ensuring it belongs to the given user.
     *
     * @param plantId the plant ID
     * @param userId  the authenticated user's ID
     * @return the plant entity
     * @throws ResourceNotFoundException if the plant does not exist or
     *                                   does not belong to the user
     */
    public Plant getPlantById(Long plantId, Long userId) {
        logger.info("Fetching plant ID: {} for user ID: {}", plantId, userId);
        return plantRepository.findByIdAndUserId(plantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Plant", plantId));
    }

    /**
     * Create a new plant for the authenticated user.
     *
     * <p>If {@code lastWatered} is provided, the {@code nextWatering} date
     * is automatically calculated by adding the watering frequency.</p>
     *
     * @param request the plant details from the client
     * @param user    the authenticated user entity
     * @return the persisted plant entity
     */
    @Transactional
    public Plant createPlant(PlantRequest request, User user) {
        Plant plant = Plant.builder()
                .name(request.getName())
                .species(request.getSpecies())
                .location(request.getLocation())
                .wateringFrequencyDays(request.getWateringFrequencyDays())
                .lastWatered(request.getLastWatered())
                .lightRequirement(request.getLightRequirement())
                .notes(request.getNotes())
                .healthStatus("HEALTHY")
                .user(user)
                .build();

        // Calculate next watering date if last-watered is provided
        calculateNextWatering(plant);

        Plant saved = plantRepository.save(plant);
        logger.info("Created plant '{}' (ID: {}) for user '{}'",
                saved.getName(), saved.getId(), user.getUsername());
        return saved;
    }

    /**
     * Update an existing plant's details.
     *
     * @param plantId the plant ID to update
     * @param request the updated details
     * @param userId  the authenticated user's ID
     * @return the updated plant entity
     * @throws ResourceNotFoundException if the plant does not exist or
     *                                   does not belong to the user
     */
    @Transactional
    public Plant updatePlant(Long plantId, PlantRequest request, Long userId) {
        Plant plant = plantRepository.findByIdAndUserId(plantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Plant", plantId));

        plant.setName(request.getName());
        plant.setSpecies(request.getSpecies());
        plant.setLocation(request.getLocation());
        plant.setWateringFrequencyDays(request.getWateringFrequencyDays());
        plant.setLastWatered(request.getLastWatered());
        plant.setLightRequirement(request.getLightRequirement());
        plant.setNotes(request.getNotes());

        // Recalculate next watering date
        calculateNextWatering(plant);

        Plant updated = plantRepository.save(plant);
        logger.info("Updated plant '{}' (ID: {})", updated.getName(), updated.getId());
        return updated;
    }

    /**
     * Delete a plant and its associated sensor data.
     *
     * @param plantId the plant ID to delete
     * @param userId  the authenticated user's ID
     * @throws ResourceNotFoundException if the plant does not exist or
     *                                   does not belong to the user
     */
    @Transactional
    public void deletePlant(Long plantId, Long userId) {
        Plant plant = plantRepository.findByIdAndUserId(plantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Plant", plantId));

        plantRepository.delete(plant);
        logger.info("Deleted plant '{}' (ID: {})", plant.getName(), plantId);
    }

    /**
     * Calculate the next watering date based on the last-watered date
     * and watering frequency.  If no last-watered date is set, the
     * next watering is calculated from today.
     */
    private void calculateNextWatering(Plant plant) {
        if (plant.getWateringFrequencyDays() != null) {
            LocalDate base = plant.getLastWatered() != null
                    ? plant.getLastWatered()
                    : LocalDate.now();
            plant.setNextWatering(base.plusDays(plant.getWateringFrequencyDays()));
        }
    }
}
