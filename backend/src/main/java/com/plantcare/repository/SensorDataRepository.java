package com.plantcare.repository;

import com.plantcare.model.SensorData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link SensorData} entities.
 *
 * <p>Readings are queried by plant ID so they remain scoped to the
 * owning user's plants (ownership is enforced at the service layer).</p>
 */
@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {

    /** Return all sensor readings for a given plant, newest first. */
    List<SensorData> findByPlantIdOrderByRecordedAtDesc(Long plantId);

    /** Return the most recent reading for a given plant. */
    Optional<SensorData> findTopByPlantIdOrderByRecordedAtDesc(Long plantId);
}
