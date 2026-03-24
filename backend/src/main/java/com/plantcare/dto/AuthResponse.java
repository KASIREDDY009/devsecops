package com.plantcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO returned after successful authentication (login or signup).
 *
 * <p>Contains the JWT token that the client must include in the
 * {@code Authorization: Bearer <token>} header for subsequent requests.</p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String username;
    private String message;
}
