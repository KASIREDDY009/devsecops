package com.plantcare.controller;

import com.plantcare.config.JwtAuthFilter;
import com.plantcare.config.JwtService;
import com.plantcare.model.SensorData;
import com.plantcare.model.User;
import com.plantcare.service.SensorDataService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SensorDataController.class)
@AutoConfigureMockMvc(addFilters = false)
class SensorDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SensorDataService sensorDataService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private User createTestUser() {
        return User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encoded")
                .build();
    }

    @Test
    @DisplayName("GET /api/sensor-data/plant/{plantId} should return sensor data list")
    void getSensorData_Success() throws Exception {
        SensorData sd1 = SensorData.builder()
                .id(1L).soilMoisture(55.0).temperature(22.0)
                .humidity(60.0).lightLevel(5000.0)
                .recordedAt(LocalDateTime.now())
                .build();
        SensorData sd2 = SensorData.builder()
                .id(2L).soilMoisture(45.0).temperature(21.0)
                .humidity(55.0).lightLevel(4500.0)
                .recordedAt(LocalDateTime.now().minusHours(1))
                .build();

        when(sensorDataService.getSensorDataByPlant(1L, 1L))
                .thenReturn(Arrays.asList(sd1, sd2));

        mockMvc.perform(get("/api/sensor-data/plant/1")
                        .with(user(createTestUser())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/sensor-data/plant/{plantId}/latest should return latest reading")
    void getLatestSensorData_Success() throws Exception {
        SensorData latest = SensorData.builder()
                .id(1L).soilMoisture(55.0).temperature(22.0)
                .humidity(60.0).lightLevel(5000.0)
                .recordedAt(LocalDateTime.now())
                .build();

        when(sensorDataService.getLatestSensorData(1L, 1L)).thenReturn(latest);

        mockMvc.perform(get("/api/sensor-data/plant/1/latest")
                        .with(user(createTestUser())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/sensor-data/plant/{plantId} should return empty list when no data")
    void getSensorData_Empty() throws Exception {
        when(sensorDataService.getSensorDataByPlant(1L, 1L))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/sensor-data/plant/1")
                        .with(user(createTestUser())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}
