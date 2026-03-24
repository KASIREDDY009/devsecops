package com.plantcare.controller;

import com.plantcare.dto.AuthResponse;
import com.plantcare.dto.LoginRequest;
import com.plantcare.dto.SignupRequest;
import com.plantcare.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints (signup and login).
 *
 * <p>These endpoints are publicly accessible (see
 * {@link com.plantcare.config.SecurityConfig}) because users must be
 * able to register and authenticate before they can obtain a JWT.</p>
 *
 * <p><b>Security note:</b> all request bodies are validated with
 * {@code @Valid} so that malformed input is rejected at the controller
 * boundary before reaching the service layer.</p>
 *
 * <p><b>Original contribution:</b> RESTful auth API design with
 * consistent response format and input validation for the plant-care
 * monitoring system.</p>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new user account.
     *
     * @param request validated signup details
     * @return 201 Created with the JWT token
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        logger.info("Signup request received for username: {}", request.getUsername());
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate an existing user.
     *
     * @param request validated login credentials
     * @return 200 OK with the JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Login request received for username: {}", request.getUsername());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
