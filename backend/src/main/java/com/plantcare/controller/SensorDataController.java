package com.plantcare.controller;

import com.plantcare.dto.SensorDataRequest;
import com.plantcare.model.SensorData;
import com.plantcare.model.User;
import com.plantcare.service.SensorDataService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for sensor data operations.
 *
 * <p>All endpoints require JWT authentication.  Sensor data is always
 * associated with a plant, and the service layer verifies that the
 * plant belongs to the authenticated user before allowing access.</p>
 *
 * <p><b>Original contribution:</b> RESTful sensor-data API supporting
 * IoT device integration — devices submit readings via POST, and the
 * frontend retrieves historical or latest data via GET endpoints.  The
 * automatic health-status update on data ingestion is a key feature
 * enabling proactive plant care.</p>
 */
@RestController
@RequestMapping("/api/sensor-data")
public class SensorDataController {

    private static final Logger logger = LoggerFactory.getLogger(SensorDataController.class);

    private final SensorDataService sensorDataService;

    public SensorDataController(SensorDataService sensorDataService) {
        this.sensorDataService = sensorDataService;
    }

    /**
     * Record a new sensor reading for a plant.
     *
     * <p>This endpoint is designed to be called by IoT sensor devices.
     * The plant's health status is automatically updated based on the
     * soil-moisture value.</p>
     *
     * @param request validated sensor data
     * @param user    the authenticated user
     * @return 201 Created with the persisted sensor data
     */
    @PostMapping
    public ResponseEntity<SensorData> recordSensorData(
            @Valid @RequestBody SensorDataRequest request,
            @AuthenticationPrincipal User user) {
        logger.info("POST /api/sensor-data — plantId: {}, user: {}",
                request.getPlantId(), user.getUsername());
        SensorData data = sensorDataService.recordSensorData(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }

    /**
     * Retrieve all sensor readings for a specific plant, newest first.
     *
     * @param plantId the plant ID
     * @param user    the authenticated user
     * @return 200 OK with the list of sensor readings
     */
    @GetMapping("/plant/{plantId}")
    public ResponseEntity<List<SensorData>> getSensorDataByPlant(
            @PathVariable Long plantId,
            @AuthenticationPrincipal User user) {
        logger.info("GET /api/sensor-data/plant/{} — user: {}", plantId, user.getUsername());
        List<SensorData> data = sensorDataService.getSensorDataByPlant(plantId, user.getId());
        return ResponseEntity.ok(data);
    }

    /**
     * Retrieve the most recent sensor reading for a specific plant.
     *
     * @param plantId the plant ID
     * @param user    the authenticated user
     * @return 200 OK with the latest sensor data
     */
    @GetMapping("/plant/{plantId}/latest")
    public ResponseEntity<SensorData> getLatestSensorData(
            @PathVariable Long plantId,
            @AuthenticationPrincipal User user) {
        logger.info("GET /api/sensor-data/plant/{}/latest — user: {}", plantId, user.getUsername());
        SensorData data = sensorDataService.getLatestSensorData(plantId, user.getId());
        return ResponseEntity.ok(data);
    }
}
