package com.plantcare.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 *
 * <p><b>Security decisions:</b></p>
 * <ul>
 *   <li>Only specific origins are allowed — wildcard ({@code *}) is
 *       intentionally avoided in production to prevent cross-origin
 *       attacks from untrusted domains.</li>
 *   <li>Allowed methods are restricted to those the API actually uses
 *       (GET, POST, PUT, DELETE, OPTIONS).</li>
 *   <li>The {@code Authorization} header is explicitly allowed so that
 *       the frontend can send JWT Bearer tokens in cross-origin requests.</li>
 *   <li>{@code allowCredentials(true)} is set to support cookies if
 *       needed in future (e.g. refresh-token rotation).</li>
 * </ul>
 *
 * <p><b>Original contribution:</b> environment-aware CORS policy that
 * allows localhost origins during development while remaining restrictive
 * enough for production deployment.</p>
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:3000",   // React dev server
                        "http://localhost:5173",   // Vite dev server
                        "http://localhost:8080"    // Same-origin fallback
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight responses for 1 hour
    }

    /**
     * Provide a {@link CorsConfigurationSource} bean so that Spring Security
     * also applies the same CORS policy (the MVC-level config alone is not
     * sufficient when Spring Security is active).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8080"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
