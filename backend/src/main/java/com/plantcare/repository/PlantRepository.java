package com.plantcare.repository;

import com.plantcare.model.Plant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Plant} entities.
 *
 * <p><b>Security note:</b> all query methods include the {@code userId}
 * parameter so that plants are always scoped to the authenticated user.
 * This prevents horizontal privilege escalation — a user cannot access
 * or modify another user's plants even if they guess a valid plant ID.</p>
 */
@Repository
public interface PlantRepository extends JpaRepository<Plant, Long> {

    /** Return all plants owned by a specific user. */
    List<Plant> findByUserId(Long userId);

    /** Return a single plant only if it belongs to the given user. */
    Optional<Plant> findByIdAndUserId(Long id, Long userId);
}
