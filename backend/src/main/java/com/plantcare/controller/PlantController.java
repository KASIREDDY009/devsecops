package com.plantcare.controller;

import com.plantcare.dto.PlantRequest;
import com.plantcare.model.Plant;
import com.plantcare.model.User;
import com.plantcare.service.PlantService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for plant CRUD operations.
 *
 * <p>All endpoints require JWT authentication.  The authenticated user
 * is injected via {@code @AuthenticationPrincipal} and passed to the
 * service layer so that all operations are scoped to the current user's
 * plants (preventing IDOR vulnerabilities).</p>
 *
 * <p><b>Original contribution:</b> full RESTful CRUD API for plant
 * management with user-scoped access control, automatic next-watering
 * calculation and input validation.</p>
 */
@RestController
@RequestMapping("/api/plants")
public class PlantController {

    private static final Logger logger = LoggerFactory.getLogger(PlantController.class);

    private final PlantService plantService;

    public PlantController(PlantService plantService) {
        this.plantService = plantService;
    }

    /**
     * List all plants belonging to the authenticated user.
     *
     * @param user the authenticated user (injected by Spring Security)
     * @return 200 OK with the list of plants
     */
    @GetMapping
    public ResponseEntity<List<Plant>> getAllPlants(@AuthenticationPrincipal User user) {
        logger.info("GET /api/plants — user: {}", user.getUsername());
        List<Plant> plants = plantService.getAllPlantsByUser(user.getId());
        return ResponseEntity.ok(plants);
    }

    /**
     * Retrieve a single plant by its ID.
     *
     * @param id   the plant ID
     * @param user the authenticated user
     * @return 200 OK with the plant, or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Plant> getPlantById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        logger.info("GET /api/plants/{} — user: {}", id, user.getUsername());
        Plant plant = plantService.getPlantById(id, user.getId());
        return ResponseEntity.ok(plant);
    }

    /**
     * Create a new plant.
     *
     * @param request validated plant details
     * @param user    the authenticated user
     * @return 201 Created with the new plant
     */
    @PostMapping
    public ResponseEntity<Plant> createPlant(
            @Valid @RequestBody PlantRequest request,
            @AuthenticationPrincipal User user) {
        logger.info("POST /api/plants — name: '{}', user: {}",
                request.getName(), user.getUsername());
        Plant plant = plantService.createPlant(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(plant);
    }

    /**
     * Update an existing plant.
     *
     * @param id      the plant ID to update
     * @param request validated updated details
     * @param user    the authenticated user
     * @return 200 OK with the updated plant, or 404 if not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Plant> updatePlant(
            @PathVariable Long id,
            @Valid @RequestBody PlantRequest request,
            @AuthenticationPrincipal User user) {
        logger.info("PUT /api/plants/{} — user: {}", id, user.getUsername());
        Plant plant = plantService.updatePlant(id, request, user.getId());
        return ResponseEntity.ok(plant);
    }

    /**
     * Delete a plant and all its associated sensor data.
     *
     * @param id   the plant ID to delete
     * @param user the authenticated user
     * @return 204 No Content on success, or 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlant(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        logger.info("DELETE /api/plants/{} — user: {}", id, user.getUsername());
        plantService.deletePlant(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
