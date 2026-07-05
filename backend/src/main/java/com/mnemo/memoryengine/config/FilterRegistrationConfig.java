package com.mnemo.memoryengine.config;

import com.mnemo.memoryengine.security.JwtAuthFilter;
import com.mnemo.memoryengine.security.RateLimitFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * JwtAuthFilter and RateLimitFilter are Spring @Component beans so they can be
 * constructor-injected into SecurityConfig and added explicitly to the Spring
 * Security filter chain via addFilterBefore/addFilterAfter. Without this class,
 * Spring Boot's servlet auto-configuration ALSO registers any Filter bean as a
 * generic application-wide filter — meaning both filters would run twice per
 * request (once via Spring Security's chain, once via the generic registration).
 * For RateLimitFilter that would silently halve the effective rate limit and
 * corrupt the request counters; this disables the redundant generic registration.
 */
@Configuration
public class FilterRegistrationConfig {

    @Bean
    public FilterRegistrationBean<JwtAuthFilter> disableJwtAuthFilterAutoRegistration(JwtAuthFilter filter) {
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<RateLimitFilter> disableRateLimitFilterAutoRegistration(RateLimitFilter filter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}
