package com.plantcare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for login requests.
 *
 * <p>Validation is applied here (at the API boundary) so that malformed
 * requests are rejected before reaching the authentication service,
 * reducing unnecessary processing and potential timing-attack surface.</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
