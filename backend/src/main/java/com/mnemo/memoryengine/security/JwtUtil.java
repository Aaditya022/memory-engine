package com.mnemo.memoryengine.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long accessTokenTtlMinutes;
    private final long refreshTokenTtlDays;

    public JwtUtil(@Value("${app.jwt.secret}") String secret,
                    @Value("${app.jwt.access-token-ttl-minutes}") long accessTokenTtlMinutes,
                    @Value("${app.jwt.refresh-token-ttl-days}") long refreshTokenTtlDays) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret must be at least 32 characters. Set JWT_SECRET to a strong random value " +
                    "before starting in any non-local environment (e.g. `openssl rand -base64 48`).");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenTtlMinutes = accessTokenTtlMinutes;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    public String generateToken(UUID userId, String email, String role, UUID organizationId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(email)
                .claim("userId", userId.toString())
                .claim("role", role)
                .claim("organizationId", organizationId.toString())
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(UUID userId, String email) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(email)
                .claim("userId", userId.toString())
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(refreshTokenTtlDays, ChronoUnit.DAYS)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(extractClaim(token, c -> c.get("userId", String.class)));
    }

    public UUID extractOrganizationId(String token) {
        return UUID.fromString(extractClaim(token, c -> c.get("organizationId", String.class)));
    }

    public String extractRole(String token) {
        return extractClaim(token, c -> c.get("role", String.class));
    }

    public String extractTokenId(String token) {
        return extractClaim(token, Claims::getId);
    }

    public String extractType(String token) {
        return extractClaim(token, c -> c.get("type", String.class));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(extractType(token));
    }

    public long remainingTtlSeconds(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        long remaining = (expiration.getTime() - System.currentTimeMillis()) / 1000;
        return Math.max(remaining, 0);
    }

    public boolean isTokenValid(String token, String expectedEmail) {
        String email = extractEmail(token);
        return email.equals(expectedEmail) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return resolver.apply(claims);
    }
}
