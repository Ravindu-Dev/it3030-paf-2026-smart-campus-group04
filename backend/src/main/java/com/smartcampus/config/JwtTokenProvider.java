package com.smartcampus.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility class for JWT token operations.
 *
 * <p>
 * Responsibilities:
 * </p>
 * <ul>
 * <li>Generate a JWT containing the user's MongoDB ID as the subject</li>
 * <li>Validate incoming JWT tokens</li>
 * <li>Extract the user ID (subject) from a valid token</li>
 * </ul>
 *
 * <p>
 * Configuration is read from application.yml (backed by .env):
 * </p>
 * <ul>
 * <li>{@code app.jwt.secret} — HMAC-SHA signing key (min 32 chars)</li>
 * <li>{@code app.jwt.expiration} — Token lifetime in milliseconds</li>
 * </ul>
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Generate a JWT token for the given user ID.
     *
     * @param userId the MongoDB document ID of the user
     * @return signed JWT string
     */
    public String generateToken(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extract the user ID (subject claim) from a valid JWT.
     *
     * @param token JWT string
     * @return user ID
     */
    public String getUserIdFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Validate a JWT token.
     *
     * @param token JWT string to validate
     * @return true if the token is valid and not expired
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException ex) {
            logger.error("JWT token expired: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }
}
