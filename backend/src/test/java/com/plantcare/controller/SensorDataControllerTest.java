package com.plantcare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plantcare.config.JwtAuthFilter;
import com.plantcare.config.JwtService;
import com.plantcare.config.SecurityConfig;
import com.plantcare.model.Plant;
import com.plantcare.model.SensorData;
import com.plantcare.model.User;
import com.plantcare.service.SensorDataService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SensorDataController.class)
@Import(SecurityConfig.class)
class SensorDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SensorDataService sensorDataService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
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
        User testUser = createTestUser();
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
                        .with(user(testUser)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/sensor-data/plant/{plantId} should return 401 without auth")
    void getSensorData_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/sensor-data/plant/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/sensor-data/plant/{plantId}/latest should return latest reading")
    void getLatestSensorData_Success() throws Exception {
        User testUser = createTestUser();
        SensorData latest = SensorData.builder()
                .id(1L).soilMoisture(55.0).temperature(22.0)
                .humidity(60.0).lightLevel(5000.0)
                .recordedAt(LocalDateTime.now())
                .build();

        when(sensorDataService.getLatestSensorData(1L, 1L)).thenReturn(latest);

        mockMvc.perform(get("/api/sensor-data/plant/1/latest")
                        .with(user(testUser)))
                .andExpect(status().isOk());
    }
}
