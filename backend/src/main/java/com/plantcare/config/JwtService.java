package com.plantcare.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service responsible for creating, parsing and validating JSON Web Tokens.
 *
 * <p><b>Security decisions:</b></p>
 * <ul>
 *   <li><b>HMAC-SHA256 signing:</b> chosen because this is a single-service
 *       deployment where the same key is used for signing and verification.
 *       In a microservice architecture, asymmetric signing (RS256 / ES256)
 *       would be preferred so that services can verify tokens without
 *       possessing the private key.</li>
 *   <li><b>Token expiration:</b> set to 24 hours (configurable via
 *       {@code jwt.expiration}).  Short-lived tokens limit the damage
 *       window if a token is compromised.</li>
 *   <li><b>Secret key length:</b> the key must be at least 256 bits
 *       (32 bytes) to satisfy the HS256 algorithm requirement.  The
 *       default value is for development only; production deployments
 *       MUST inject a cryptographically random secret via the
 *       {@code JWT_SECRET} environment variable.</li>
 * </ul>
 *
 * <p><b>Original contribution:</b> encapsulation of all JWT operations
 * behind a clean service interface, separating token mechanics from
 * the Spring Security filter chain.</p>
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Extract the username (subject) from a JWT token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract a specific claim from the token using a resolver function.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generate a JWT token for the given user with no extra claims.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generate a JWT token with additional custom claims.
     *
     * @param extraClaims additional key-value pairs to embed in the token
     * @param userDetails the authenticated user
     * @return signed JWT string
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validate a token by checking the username match and expiration.
     *
     * @param token       the JWT string
     * @param userDetails the user to validate against
     * @return true if the token is valid for this user
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Check whether the token has expired.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Parse the token and extract all claims.  If the token is tampered
     * with or expired, the JJWT library will throw an appropriate exception.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Derive the HMAC-SHA signing key from the Base64-encoded secret.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
