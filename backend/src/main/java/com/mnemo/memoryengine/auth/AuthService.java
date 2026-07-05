package com.mnemo.memoryengine.auth;

import com.mnemo.memoryengine.auth.dto.AuthResponse;
import com.mnemo.memoryengine.auth.dto.LoginRequest;
import com.mnemo.memoryengine.auth.dto.RegisterRequest;
import com.mnemo.memoryengine.common.BadRequestException;
import com.mnemo.memoryengine.common.UnauthorizedException;
import com.mnemo.memoryengine.organization.Organization;
import com.mnemo.memoryengine.organization.OrganizationRepository;
import com.mnemo.memoryengine.security.JwtUtil;
import com.mnemo.memoryengine.security.TokenBlacklistService;
import com.mnemo.memoryengine.user.Role;
import com.mnemo.memoryengine.user.User;
import com.mnemo.memoryengine.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthService(UserRepository userRepository,
                        OrganizationRepository organizationRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil,
                        TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            // Deliberately vague — do not confirm/deny which part of registration failed
            // beyond "email taken", which is unavoidable UX-wise for self-serve signup.
            throw new BadRequestException("Email already registered");
        }

        Organization organization = new Organization(request.organizationName());
        organization = organizationRepository.save(organization);

        User user = new User();
        user.setOrganization(organization);
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        // first user in a new org is made ADMIN
        user.setRole(Role.ADMIN);
        user = userRepository.save(user);

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return issueTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Not a refresh token");
        }
        String email = jwtUtil.extractEmail(refreshToken);
        if (!jwtUtil.isTokenValid(refreshToken, email)) {
            throw new UnauthorizedException("Refresh token expired or invalid");
        }
        if (tokenBlacklistService.isBlacklisted(jwtUtil.extractTokenId(refreshToken))) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        // Rotate: invalidate the used refresh token so it can't be replayed.
        tokenBlacklistService.blacklist(jwtUtil.extractTokenId(refreshToken), jwtUtil.remainingTtlSeconds(refreshToken));

        return issueTokens(user);
    }

    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null) {
            tokenBlacklistService.blacklist(jwtUtil.extractTokenId(accessToken), jwtUtil.remainingTtlSeconds(accessToken));
        }
        if (refreshToken != null) {
            tokenBlacklistService.blacklist(jwtUtil.extractTokenId(refreshToken), jwtUtil.remainingTtlSeconds(refreshToken));
        }
    }

    private AuthResponse issueTokens(User user) {
        UUID orgId = user.getOrganization().getId();
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), orgId);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());
        return new AuthResponse(accessToken, refreshToken, user.getId(), user.getRole().name(), orgId);
    }
}
