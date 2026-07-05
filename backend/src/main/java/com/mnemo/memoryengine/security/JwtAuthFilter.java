package com.mnemo.memoryengine.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Validates the Bearer JWT on every request and, if valid, populates the
 * SecurityContext with an authenticated principal carrying userId / role / orgId.
 * Falls through silently (unauthenticated) so that public endpoints (auth, health)
 * are unaffected — Spring Security's authorization rules decide what happens next.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthFilter(JwtUtil jwtUtil, TokenBlacklistService tokenBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtUtil.extractEmail(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.isTokenValid(token, email)
                        && !jwtUtil.isRefreshToken(token)
                        && !tokenBlacklistService.isBlacklisted(jwtUtil.extractTokenId(token))) {
                    String role = jwtUtil.extractRole(token);
                    AuthenticatedPrincipal principal = new AuthenticatedPrincipal(
                            jwtUtil.extractUserId(token),
                            email,
                            jwtUtil.extractOrganizationId(token),
                            role
                    );

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    authToken.setDetails(request);
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            // Invalid/expired token -> leave request unauthenticated, Security filter chain will reject as needed.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
