package com.mnemo.memoryengine.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Refuses to start under the "prod" Spring profile if obviously-unsafe default
 * secrets are still in place. This exists because "it works with the default
 * .env I copy-pasted" is exactly how JWT secrets end up leaked in public repos.
 */
@Component
@Profile("prod")
public class ProductionSafetyCheck {

    private static final Logger log = LoggerFactory.getLogger(ProductionSafetyCheck.class);
    private static final String DEFAULT_SECRET = "change-this-super-secret-key-in-production-min-32-chars";
    private static final String DEFAULT_DB_PASSWORD = "memory_engine";

    private final String jwtSecret;
    private final String dbPassword;
    private final String corsOrigins;

    public ProductionSafetyCheck(@Value("${app.jwt.secret}") String jwtSecret,
                                  @Value("${spring.datasource.password}") String dbPassword,
                                  @Value("${app.cors.allowed-origins}") String corsOrigins) {
        this.jwtSecret = jwtSecret;
        this.dbPassword = dbPassword;
        this.corsOrigins = corsOrigins;
    }

    @PostConstruct
    public void verify() {
        if (DEFAULT_SECRET.equals(jwtSecret)) {
            throw new IllegalStateException(
                    "Refusing to start with profile=prod: JWT_SECRET is still the default value. " +
                    "Set a real secret via `openssl rand -base64 48` in your .env file.");
        }
        if (DEFAULT_DB_PASSWORD.equals(dbPassword)) {
            throw new IllegalStateException(
                    "Refusing to start with profile=prod: DB_PASSWORD is still the default value. " +
                    "Set a real password in your .env file.");
        }
        if ("*".equals(corsOrigins.trim())) {
            log.warn("APP_CORS_ALLOWED_ORIGINS is '*' while running with profile=prod. " +
                    "This allows any website to call the API with a logged-in user's browser. " +
                    "Set it to your real frontend origin(s) unless this is intentional.");
        }
    }
}
