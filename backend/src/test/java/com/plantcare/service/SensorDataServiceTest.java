package com.plantcare.service;

import com.plantcare.dto.SensorDataRequest;
import com.plantcare.exception.ResourceNotFoundException;
import com.plantcare.model.Plant;
import com.plantcare.model.SensorData;
import com.plantcare.model.User;
import com.plantcare.repository.PlantRepository;
import com.plantcare.repository.SensorDataRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SensorDataServiceTest {

    @Mock
    private SensorDataRepository sensorDataRepository;

    @Mock
    private PlantRepository plantRepository;

    @InjectMocks
    private SensorDataService sensorDataService;

    private Plant testPlant;
    private User testUser;
    private SensorDataRequest sensorRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(1L).username("testuser").build();
        testPlant = Plant.builder()
                .id(1L)
                .name("Test Plant")
                .species("Fern")
                .healthStatus("HEALTHY")
                .user(testUser)
                .build();
        sensorRequest = new SensorDataRequest();
        sensorRequest.setPlantId(1L);
        sensorRequest.setSoilMoisture(55.0);
        sensorRequest.setTemperature(22.5);
        sensorRequest.setLightLevel(5000.0);
        sensorRequest.setHumidity(60.0);
    }

    @Test
    @DisplayName("recordSensorData should save sensor data and keep HEALTHY status for good moisture")
    void recordSensorData_HealthyMoisture() {
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(sensorDataRepository.save(any(SensorData.class))).thenAnswer(i -> {
            SensorData sd = i.getArgument(0);
            sd.setId(1L);
            return sd;
        });
        when(plantRepository.save(any(Plant.class))).thenReturn(testPlant);

        SensorData result = sensorDataService.recordSensorData(sensorRequest, 1L);

        assertNotNull(result);
        assertEquals(55.0, result.getSoilMoisture());
        assertEquals("HEALTHY", testPlant.getHealthStatus());
        verify(sensorDataRepository).save(any(SensorData.class));
    }

    @Test
    @DisplayName("recordSensorData should set NEEDS_ATTENTION for low moisture")
    void recordSensorData_NeedsAttention() {
        sensorRequest.setSoilMoisture(30.0);
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(sensorDataRepository.save(any(SensorData.class))).thenAnswer(i -> {
            SensorData sd = i.getArgument(0);
            sd.setId(1L);
            return sd;
        });
        when(plantRepository.save(any(Plant.class))).thenReturn(testPlant);

        sensorDataService.recordSensorData(sensorRequest, 1L);

        assertEquals("NEEDS_ATTENTION", testPlant.getHealthStatus());
    }

    @Test
    @DisplayName("recordSensorData should set CRITICAL for very low moisture")
    void recordSensorData_Critical() {
        sensorRequest.setSoilMoisture(10.0);
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(sensorDataRepository.save(any(SensorData.class))).thenAnswer(i -> {
            SensorData sd = i.getArgument(0);
            sd.setId(1L);
            return sd;
        });
        when(plantRepository.save(any(Plant.class))).thenReturn(testPlant);

        sensorDataService.recordSensorData(sensorRequest, 1L);

        assertEquals("CRITICAL", testPlant.getHealthStatus());
    }

    @Test
    @DisplayName("recordSensorData should throw ResourceNotFoundException for invalid plant")
    void recordSensorData_PlantNotFound() {
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> sensorDataService.recordSensorData(sensorRequest, 1L));
        verify(sensorDataRepository, never()).save(any());
    }

    @Test
    @DisplayName("getSensorDataByPlant should return sensor data list")
    void getSensorDataByPlant_Success() {
        SensorData sd1 = SensorData.builder().id(1L).soilMoisture(50.0).build();
        SensorData sd2 = SensorData.builder().id(2L).soilMoisture(45.0).build();
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(sensorDataRepository.findByPlantIdOrderByRecordedAtDesc(1L))
                .thenReturn(Arrays.asList(sd1, sd2));

        List<SensorData> result = sensorDataService.getSensorDataByPlant(1L, 1L);

        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("getSensorDataByPlant should throw exception if plant not found")
    void getSensorDataByPlant_PlantNotFound() {
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> sensorDataService.getSensorDataByPlant(1L, 1L));
    }

    @Test
    @DisplayName("getLatestSensorData should return most recent reading")
    void getLatestSensorData_Success() {
        SensorData latest = SensorData.builder()
                .id(1L).soilMoisture(55.0).recordedAt(LocalDateTime.now()).build();
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(sensorDataRepository.findTopByPlantIdOrderByRecordedAtDesc(1L))
                .thenReturn(Optional.of(latest));

        SensorData result = sensorDataService.getLatestSensorData(1L, 1L);

        assertNotNull(result);
        assertEquals(55.0, result.getSoilMoisture());
    }

    @Test
    @DisplayName("getLatestSensorData should throw exception if no sensor data exists")
    void getLatestSensorData_NoData() {
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(sensorDataRepository.findTopByPlantIdOrderByRecordedAtDesc(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> sensorDataService.getLatestSensorData(1L, 1L));
    }

    @Test
    @DisplayName("recordSensorData should not update health status when moisture is null")
    void recordSensorData_NullMoisture() {
        sensorRequest.setSoilMoisture(null);
        when(plantRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testPlant));
        when(sensorDataRepository.save(any(SensorData.class))).thenAnswer(i -> {
            SensorData sd = i.getArgument(0);
            sd.setId(1L);
            return sd;
        });

        sensorDataService.recordSensorData(sensorRequest, 1L);

        assertEquals("HEALTHY", testPlant.getHealthStatus());
        verify(plantRepository, never()).save(any(Plant.class));
    }
}
