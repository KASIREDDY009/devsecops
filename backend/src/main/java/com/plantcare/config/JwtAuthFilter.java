package com.plantcare.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter executed once per request.
 *
 * <p><b>Security decisions:</b></p>
 * <ul>
 *   <li>Extends {@link OncePerRequestFilter} to guarantee single execution
 *       even when the request is forwarded internally (e.g. by Spring's
 *       error handling).</li>
 *   <li>The filter checks the {@code Authorization} header for a
 *       {@code Bearer} token.  If absent, the request is passed down
 *       the filter chain unauthenticated — Spring Security will then
 *       return 401/403 for protected endpoints.</li>
 *   <li>Token validation failures (expired, tampered) are caught and
 *       logged, but the response is simply unauthenticated rather than
 *       returning error details, to avoid leaking security information.</li>
 *   <li>The {@code SecurityContextHolder} is populated only if the
 *       context does not already contain an authentication object,
 *       preventing re-authentication on forwarded requests.</li>
 * </ul>
 *
 * <p><b>Original contribution:</b> custom filter implementation that
 * bridges the JJWT library with Spring Security's filter chain for
 * stateless session management in the plant-care API.</p>
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Extract the Authorization header
        final String authHeader = request.getHeader("Authorization");

        // If no Bearer token is present, continue without authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String username = jwtService.extractUsername(jwt);

            // Only authenticate if the user is not already authenticated
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Create an authentication token and set it in the context
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.debug("Authenticated user: {}", username);
                }
            }
        } catch (Exception e) {
            // Log the error but do not block the filter chain — the request
            // will simply be treated as unauthenticated.
            logger.warn("JWT authentication failed: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
