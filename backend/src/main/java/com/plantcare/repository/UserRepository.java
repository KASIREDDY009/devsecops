package com.plantcare.repository;

import com.plantcare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 *
 * <p>Spring Data auto-generates the implementation at runtime from the
 * method signatures, eliminating boilerplate JDBC/SQL code and reducing
 * the risk of SQL-injection vulnerabilities.</p>
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Find a user by username — used during authentication. */
    Optional<User> findByUsername(String username);

    /** Find a user by email — used to prevent duplicate registrations. */
    Optional<User> findByEmail(String email);

    /** Check whether a username is already taken. */
    boolean existsByUsername(String username);

    /** Check whether an email is already registered. */
    boolean existsByEmail(String email);
}
