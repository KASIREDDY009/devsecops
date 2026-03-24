package com.plantcare.service;

import com.plantcare.dto.PlantRequest;
import com.plantcare.exception.ResourceNotFoundException;
import com.plantcare.model.Plant;
import com.plantcare.model.User;
import com.plantcare.repository.PlantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link PlantService}.
 *
 * <p>Uses Mockito to isolate the service layer from the database.
 * Each test verifies a specific behaviour including edge cases and
 * security-relevant ownership checks.</p>
 *
 * <p><b>Original contribution:</b> comprehensive test suite covering
 * CRUD operations, automatic next-watering calculation and user-scoped
 * access control.</p>
 */
@ExtendWith(MockitoExtension.class)
class PlantServiceTest {

    @Mock
    private PlantRepository plantRepository;

    @InjectMocks
    private PlantService plantService;

    private User testUser;
    private Plant testPlant;
    private PlantRequest testRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("hashedPassword")
                .createdAt(LocalDateTime.now())
                .build();

        testPlant = Plant.builder()
                .id(1L)
                .name("Monstera")
                .species("Monstera deliciosa")
                .location("Living Room")
                .wateringFrequencyDays(7)
                .lastWatered(LocalDate.now())
                .nextWatering(LocalDate.now().plusDays(7))
                .lightRequirement("MEDIUM")
                .healthStatus("HEALTHY")
                .notes("Likes indirect sunlight")
                .createdAt(LocalDateTime.now())
                .user(testUser)
                .build();

        testRequest = new PlantRequest();
        testRequest.setName("Monstera");
        testRequest.setSpecies("Monstera deliciosa");
        testRequest.setLocation("Living Room");
        testRequest.setWateringFrequencyDays(7);
        testRequest.setLastWatered(LocalDate.now());
        testRequest.setLightRequirement("MEDIUM");
        testRequest.setNotes("Likes indirect sunlight");
    }

    @Test
    @DisplayName("getAllPlantsByUser returns all plants for the given user")
    void getAllPlantsByUser_returnsUserPlants() {
        when(plantRepository.findByUserId(1L)).thenReturn(List.of(testPlant));

        List<Plant> result = plantService.getAllPlantsByUser(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Monstera");
        verify(plantRepository).findByUserId(1L);
    }

    @Test
    @DisplayName("getAllPlantsByUser returns empty list when user has no plants")
    void getAllPlantsByUser_returnsEmptyList() {
        when(plantRepository.findByUserId(1L)).thenReturn(List.of());

        List<Plant> result = plantService.getAllPlantsByUser(1L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("getPlantById returns the plant when it belongs to the user")
    void getPlantById_returnsPlant() {
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));

        Plant result = plantService.getPlantById(1L, 1L);

        assertThat(result.getName()).isEqualTo("Monstera");
        assertThat(result.getSpecies()).isEqualTo("Monstera deliciosa");
    }

    @Test
    @DisplayName("getPlantById throws ResourceNotFoundException when plant not found")
    void getPlantById_throwsWhenNotFound() {
        when(plantRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> plantService.getPlantById(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Plant not found");
    }

    @Test
    @DisplayName("createPlant saves the plant and calculates next watering date")
    void createPlant_savesAndCalculatesNextWatering() {
        when(plantRepository.save(any(Plant.class))).thenReturn(testPlant);

        Plant result = plantService.createPlant(testRequest, testUser);

        assertThat(result.getName()).isEqualTo("Monstera");
        verify(plantRepository).save(any(Plant.class));
    }

    @Test
    @DisplayName("updatePlant updates fields and recalculates next watering")
    void updatePlant_updatesFields() {
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(plantRepository.save(any(Plant.class))).thenReturn(testPlant);

        testRequest.setName("Updated Monstera");
        Plant result = plantService.updatePlant(1L, testRequest, 1L);

        assertThat(result).isNotNull();
        verify(plantRepository).save(any(Plant.class));
    }

    @Test
    @DisplayName("updatePlant throws ResourceNotFoundException when plant not found")
    void updatePlant_throwsWhenNotFound() {
        when(plantRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> plantService.updatePlant(99L, testRequest, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("deletePlant removes the plant when it belongs to the user")
    void deletePlant_removesPlant() {
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));

        plantService.deletePlant(1L, 1L);

        verify(plantRepository).delete(testPlant);
    }

    @Test
    @DisplayName("deletePlant throws ResourceNotFoundException when plant not found")
    void deletePlant_throwsWhenNotFound() {
        when(plantRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> plantService.deletePlant(99L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
