package com.plantcare;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test verifying that the Spring application context loads
 * successfully with all beans wired correctly.
 *
 * <p>Uses the "test" profile implicitly — H2 in-memory database is
 * used instead of PostgreSQL so that tests can run without external
 * infrastructure.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
class PlantCareApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that all Spring beans are instantiated without errors
    }
}
