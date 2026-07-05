package com.mnemo.memoryengine.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Simple, dependency-free fixed-window rate limiter backed by Redis so it works
 * correctly across multiple app replicas (unlike an in-memory counter).
 *
 * Not a substitute for edge-level protection (WAF / Cloudflare / ALB throttling)
 * against volumetric attacks — this guards the app's own request-handling
 * capacity and gives predictable 429s to well-behaved clients that misbehave.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final int maxRequestsPerWindow;
    private final long windowSeconds;

    public RateLimitFilter(StringRedisTemplate redisTemplate,
                            @Value("${app.rate-limit.max-requests}") int maxRequestsPerWindow,
                            @Value("${app.rate-limit.window-seconds}") long windowSeconds) {
        this.redisTemplate = redisTemplate;
        this.maxRequestsPerWindow = maxRequestsPerWindow;
        this.windowSeconds = windowSeconds;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        // Health checks and metrics scraping should never be throttled.
        return path.equals("/health") || path.startsWith("/actuator/health") || path.startsWith("/actuator/prometheus");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String clientKey = resolveClientKey(request);
        String redisKey = "ratelimit:" + clientKey + ":" + (System.currentTimeMillis() / (windowSeconds * 1000));

        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1L) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }

            if (count != null && count > maxRequestsPerWindow) {
                response.setStatus(429); // 429 Too Many Requests
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"success\":false,\"message\":\"Rate limit exceeded. Try again shortly.\"}");
                return;
            }
        } catch (Exception ex) {
            // If Redis is unreachable, fail OPEN rather than taking the whole API down —
            // availability of the core service matters more than rate limiting during a
            // Redis outage. This is logged so it's visible in monitoring.
            logger.warn("Rate limiter could not reach Redis, allowing request through: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /** Prefers the authenticated user (post-JWT) via header injected upstream by JwtAuthFilter is not
     *  available at this stage since rate limiting runs BEFORE auth — so this keys on client IP,
     *  respecting X-Forwarded-For when running behind a reverse proxy/load balancer. */
    private String resolveClientKey(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
