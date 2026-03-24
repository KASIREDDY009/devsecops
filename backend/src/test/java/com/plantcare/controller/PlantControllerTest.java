package com.plantcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plantcare.config.JwtAuthFilter;
import com.plantcare.config.JwtService;
import com.plantcare.config.SecurityConfig;
import com.plantcare.dto.PlantRequest;
import com.plantcare.model.Plant;
import com.plantcare.model.User;
import com.plantcare.service.PlantService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = PlantController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,
        classes = {SecurityConfig.class, JwtAuthFilter.class}))
class PlantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PlantService plantService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private User testUser;
    private Plant testPlant;

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
    }

    @Test
    @DisplayName("GET /api/plants returns 200 with list of plants")
    @WithMockUser
    void getAllPlants_returns200() throws Exception {
        when(plantService.getAllPlantsByUser(any())).thenReturn(List.of(testPlant));

        mockMvc.perform(get("/api/plants")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Monstera"));
    }

    @Test
    @DisplayName("GET /api/plants/{id} returns 200 with the plant")
    void getPlantById_returns200() throws Exception {
        when(plantService.getPlantById(any(), any())).thenReturn(testPlant);

        mockMvc.perform(get("/api/plants/1")
                        .with(user(testUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Monstera"));
    }

    @Test
    @DisplayName("POST /api/plants returns 201 when request is valid")
    void createPlant_returns201() throws Exception {
        when(plantService.createPlant(any(PlantRequest.class), any(User.class)))
                .thenReturn(testPlant);

        PlantRequest request = new PlantRequest();
        request.setName("Monstera");
        request.setSpecies("Monstera deliciosa");
        request.setLocation("Living Room");
        request.setWateringFrequencyDays(7);
        request.setLightRequirement("MEDIUM");

        mockMvc.perform(post("/api/plants")
                        .with(user(testUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Monstera"));
    }

    @Test
    @DisplayName("POST /api/plants returns 400 when name is blank")
    void createPlant_returns400WhenNameBlank() throws Exception {
        PlantRequest request = new PlantRequest();
        request.setName("");
        request.setSpecies("Monstera deliciosa");

        mockMvc.perform(post("/api/plants")
                        .with(user(testUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/plants/{id} returns 204 on success")
    void deletePlant_returns204() throws Exception {
        mockMvc.perform(delete("/api/plants/1")
                        .with(user(testUser))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
