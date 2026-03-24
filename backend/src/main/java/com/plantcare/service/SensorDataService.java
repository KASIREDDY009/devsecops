package com.plantcare.service;

import com.plantcare.dto.SensorDataRequest;
import com.plantcare.exception.ResourceNotFoundException;
import com.plantcare.model.Plant;
import com.plantcare.model.SensorData;
import com.plantcare.repository.PlantRepository;
import com.plantcare.repository.SensorDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for sensor data ingestion and retrieval.
 *
 * <p><b>Original contribution:</b> automatic health-status derivation
 * based on soil-moisture thresholds.  When a new sensor reading is
 * recorded, the parent plant's {@code healthStatus} is recalculated
 * using the following rules:</p>
 * <ul>
 *   <li>{@code soilMoisture < 20} &rarr; <b>CRITICAL</b> — the plant
 *       is severely dehydrated and needs immediate watering.</li>
 *   <li>{@code soilMoisture < 40} &rarr; <b>NEEDS_ATTENTION</b> — the
 *       soil is drying out; watering should be scheduled soon.</li>
 *   <li>{@code soilMoisture >= 40} &rarr; <b>HEALTHY</b> — moisture
 *       levels are adequate.</li>
 * </ul>
 *
 * <p>These thresholds are based on general horticultural guidance for
 * common houseplants.  A future enhancement could make them configurable
 * per species.</p>
 */
@Service
public class SensorDataService {

    private static final Logger logger = LoggerFactory.getLogger(SensorDataService.class);

    /** Soil-moisture threshold below which a plant is considered critical. */
    private static final double CRITICAL_MOISTURE_THRESHOLD = 20.0;

    /** Soil-moisture threshold below which a plant needs attention. */
    private static final double ATTENTION_MOISTURE_THRESHOLD = 40.0;

    private final SensorDataRepository sensorDataRepository;
    private final PlantRepository plantRepository;

    public SensorDataService(SensorDataRepository sensorDataRepository,
                             PlantRepository plantRepository) {
        this.sensorDataRepository = sensorDataRepository;
        this.plantRepository = plantRepository;
    }

    /**
     * Record a new sensor reading for a plant and update the plant's
     * health status based on the soil-moisture value.
     *
     * @param request the sensor data from the IoT device
     * @param userId  the authenticated user's ID (used to verify ownership)
     * @return the persisted sensor data entity
     * @throws ResourceNotFoundException if the plant does not exist or
     *                                   does not belong to the user
     */
    @Transactional
    public SensorData recordSensorData(SensorDataRequest request, Long userId) {
        // Verify the plant exists and belongs to the authenticated user
        Plant plant = plantRepository.findByIdAndUserId(request.getPlantId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Plant", request.getPlantId()));

        // Build and persist the sensor reading
        SensorData sensorData = SensorData.builder()
                .soilMoisture(request.getSoilMoisture())
                .temperature(request.getTemperature())
                .lightLevel(request.getLightLevel())
                .humidity(request.getHumidity())
                .plant(plant)
                .build();

        SensorData saved = sensorDataRepository.save(sensorData);

        // Auto-calculate the plant's health status based on soil moisture
        updatePlantHealthStatus(plant, request.getSoilMoisture());

        logger.info("Recorded sensor data (ID: {}) for plant '{}' — soil moisture: {}%",
                saved.getId(), plant.getName(), request.getSoilMoisture());

        return saved;
    }

    /**
     * Retrieve all sensor readings for a plant, ordered newest first.
     *
     * @param plantId the plant ID
     * @param userId  the authenticated user's ID
     * @return list of sensor readings
     * @throws ResourceNotFoundException if the plant does not exist or
     *                                   does not belong to the user
     */
    public List<SensorData> getSensorDataByPlant(Long plantId, Long userId) {
        // Verify ownership before returning data
        plantRepository.findByIdAndUserId(plantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Plant", plantId));

        logger.info("Fetching sensor data for plant ID: {}", plantId);
        return sensorDataRepository.findByPlantIdOrderByRecordedAtDesc(plantId);
    }

    /**
     * Retrieve the most recent sensor reading for a plant.
     *
     * @param plantId the plant ID
     * @param userId  the authenticated user's ID
     * @return the latest sensor data entity
     * @throws ResourceNotFoundException if the plant does not exist or
     *                                   has no sensor data
     */
    public SensorData getLatestSensorData(Long plantId, Long userId) {
        // Verify ownership
        plantRepository.findByIdAndUserId(plantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Plant", plantId));

        return sensorDataRepository.findTopByPlantIdOrderByRecordedAtDesc(plantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No sensor data found for plant with id: " + plantId));
    }

    /**
     * Update the plant's health status based on soil-moisture level.
     *
     * <p>This method is called automatically after every sensor reading
     * is recorded, providing real-time health monitoring.</p>
     *
     * @param plant        the plant entity to update
     * @param soilMoisture the latest soil-moisture reading (may be null)
     */
    private void updatePlantHealthStatus(Plant plant, Double soilMoisture) {
        if (soilMoisture == null) {
            return; // Cannot determine status without moisture data
        }

        String previousStatus = plant.getHealthStatus();
        String newStatus;

        if (soilMoisture < CRITICAL_MOISTURE_THRESHOLD) {
            newStatus = "CRITICAL";
        } else if (soilMoisture < ATTENTION_MOISTURE_THRESHOLD) {
            newStatus = "NEEDS_ATTENTION";
        } else {
            newStatus = "HEALTHY";
        }

        plant.setHealthStatus(newStatus);
        plantRepository.save(plant);

        // Log status changes for monitoring and alerting
        if (!newStatus.equals(previousStatus)) {
            logger.warn("Plant '{}' health status changed: {} -> {}",
                    plant.getName(), previousStatus, newStatus);
        }
    }
}
