package com.plantcare.config;

import com.plantcare.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Application-wide bean configuration.
 *
 * <p><b>Original contribution:</b> provides a {@link UserDetailsService}
 * bean that bridges Spring Security's authentication mechanism with the
 * application's JPA-based {@link UserRepository}.  This keeps the
 * security configuration decoupled from the data-access layer.</p>
 */
@Configuration
public class AppConfig {

    private final UserRepository userRepository;

    public AppConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Load a user from the database by username.
     *
     * <p>The error message is intentionally generic ("User not found")
     * rather than specifying the username, to prevent user-enumeration
     * attacks via the authentication endpoint.</p>
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
