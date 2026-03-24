package com.plantcare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * JPA entity representing an application user.
 *
 * <p><b>Security decisions:</b></p>
 * <ul>
 *   <li>Implements {@link UserDetails} so Spring Security can use it directly
 *       in the authentication manager — avoids an unnecessary adapter layer.</li>
 *   <li>The password field stores a BCrypt hash (cost factor 10 by default).
 *       BCrypt was chosen over SHA-256 because it is an adaptive hash function
 *       that intentionally slows brute-force attacks.</li>
 *   <li>The {@code @Column(unique = true)} constraints on username and email
 *       enforce uniqueness at the database level, preventing race-condition
 *       duplicates that application-level checks alone cannot guarantee.</li>
 * </ul>
 *
 * <p><b>Original contribution:</b> integration of Spring Security's
 * {@code UserDetails} contract directly into the JPA entity to reduce
 * boilerplate while maintaining clean separation of authentication concerns.</p>
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * BCrypt-hashed password.  Never stored or transmitted in plain text.
     */
    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Automatically set the creation timestamp before the first persist.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ---- UserDetails contract ------------------------------------------------

    /**
     * Every user receives the ROLE_USER authority.  Role-based access control
     * can be extended here if admin or operator roles are needed in future.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
