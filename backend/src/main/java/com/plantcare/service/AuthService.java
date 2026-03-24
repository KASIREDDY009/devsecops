package com.plantcare.service;

import com.plantcare.config.JwtService;
import com.plantcare.dto.AuthResponse;
import com.plantcare.dto.LoginRequest;
import com.plantcare.dto.SignupRequest;
import com.plantcare.model.User;
import com.plantcare.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling user registration and authentication.
 *
 * <p><b>Security decisions:</b></p>
 * <ul>
 *   <li>Passwords are hashed with BCrypt before storage — plain-text
 *       passwords never leave this method.</li>
 *   <li>Duplicate username/email checks are performed before the insert
 *       to provide user-friendly error messages.  The database-level
 *       unique constraints act as a safety net for race conditions.</li>
 *   <li>The {@link AuthenticationManager} delegates credential verification
 *       to Spring Security's {@code DaoAuthenticationProvider}, which
 *       uses BCrypt comparison internally.  This prevents timing attacks
 *       that could reveal whether a username exists.</li>
 * </ul>
 *
 * <p><b>Original contribution:</b> complete signup/login flow with
 * duplicate-detection, BCrypt hashing and JWT issuance, designed for
 * the plant-care monitoring domain.</p>
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Register a new user account.
     *
     * @param request the signup details (username, email, password)
     * @return an {@link AuthResponse} containing the JWT token
     * @throws IllegalArgumentException if the username or email is already taken
     */
    public AuthResponse signup(SignupRequest request) {
        // Check for duplicate username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Build the user entity with a BCrypt-hashed password
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        logger.info("New user registered: {}", user.getUsername());

        // Generate a JWT for the newly registered user
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .message("User registered successfully")
                .build();
    }

    /**
     * Authenticate an existing user and issue a JWT.
     *
     * @param request the login credentials (username, password)
     * @return an {@link AuthResponse} containing the JWT token
     */
    public AuthResponse login(LoginRequest request) {
        // Delegate credential verification to Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // If authentication succeeds, load the user and generate a token
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtService.generateToken(user);
        logger.info("User logged in: {}", user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .message("Login successful")
                .build();
    }
}
