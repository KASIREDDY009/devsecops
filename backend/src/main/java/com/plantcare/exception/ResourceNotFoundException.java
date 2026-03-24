package com.plantcare.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a requested resource (Plant, SensorData, User) does not exist
 * or is not accessible by the authenticated user.
 *
 * <p>The {@code @ResponseStatus} annotation ensures Spring MVC returns a
 * 404 response automatically if this exception is not caught by a
 * controller-advice handler.</p>
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s not found with id: %d", resourceName, id));
    }
}
