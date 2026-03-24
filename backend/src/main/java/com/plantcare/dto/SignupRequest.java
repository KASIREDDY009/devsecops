package com.plantcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user registration requests.
 *
 * <p><b>Validation rationale:</b></p>
 * <ul>
 *   <li>Username length (3–50) prevents trivially short names that are
 *       easy to guess and excessively long names that could cause UI or
 *       storage issues.</li>
 *   <li>Password minimum length of 8 follows NIST SP 800-63B guidance
 *       for memorised secrets.</li>
 *   <li>Email format is validated so that downstream notification
 *       services do not receive malformed addresses.</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 120, message = "Password must be between 8 and 120 characters")
    private String password;
}
