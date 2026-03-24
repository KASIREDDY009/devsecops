package com.plantcare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Automated Plant Care Monitoring System.
 *
 * <p>This Spring Boot application provides a REST API for managing plants,
 * recording sensor data (soil moisture, temperature, light, humidity) and
 * automating watering schedules.  Authentication is handled via stateless
 * JWT tokens — see {@link com.plantcare.config.SecurityConfig} for the
 * full security chain configuration.</p>
 *
 * <p><b>Original contribution:</b> end-to-end design of the domain model,
 * sensor-driven health-status calculation, and JWT security integration
 * tailored for IoT plant-monitoring use cases.</p>
 *
 * @author Tarun Chintakunta — MSc Cloud DevOpsSec
 */
@SpringBootApplication
public class PlantCareApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlantCareApplication.class, args);
    }
}
