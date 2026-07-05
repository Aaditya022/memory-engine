package com.mnemo.memoryengine.security;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * JWTs are stateless by design, which normally means "logout" can't truly
 * revoke a token before it expires. This service closes that gap cheaply:
 * on logout we store the token's jti in Redis with a TTL equal to its
 * remaining lifetime, and JwtAuthFilter rejects any token whose jti is
 * blacklisted. Cost is one Redis lookup per authenticated request.
 */
@Service
public class TokenBlacklistService {

    private static final String PREFIX = "blacklist:jti:";

    private final StringRedisTemplate redisTemplate;

    public TokenBlacklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blacklist(String jti, long ttlSeconds) {
        if (ttlSeconds <= 0) return;
        redisTemplate.opsForValue().set(PREFIX + jti, "1", Duration.ofSeconds(ttlSeconds));
    }

    public boolean isBlacklisted(String jti) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(PREFIX + jti));
        } catch (Exception ex) {
            // If Redis is down, fail open on blacklist checks too (same tradeoff as
            // RateLimitFilter) — a revoked-but-not-yet-expired token slipping through
            // during a Redis outage is a lesser risk than an outage taking down auth entirely.
            return false;
        }
    }
}
