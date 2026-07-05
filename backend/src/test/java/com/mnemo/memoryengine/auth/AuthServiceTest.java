package com.mnemo.memoryengine.auth;

import com.mnemo.memoryengine.auth.dto.AuthResponse;
import com.mnemo.memoryengine.auth.dto.RegisterRequest;
import com.mnemo.memoryengine.common.BadRequestException;
import com.mnemo.memoryengine.organization.Organization;
import com.mnemo.memoryengine.organization.OrganizationRepository;
import com.mnemo.memoryengine.security.JwtUtil;
import com.mnemo.memoryengine.security.TokenBlacklistService;
import com.mnemo.memoryengine.user.User;
import com.mnemo.memoryengine.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock OrganizationRepository organizationRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock TokenBlacklistService tokenBlacklistService;

    @InjectMocks AuthService authService;

    private RegisterRequest request;

    @BeforeEach
    void setUp() {
        request = new RegisterRequest("Acme Inc", "Aditya", "aditya@example.com", "password123");
    }

    @Test
    void registerCreatesOrganizationAndAdminUser() {
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(organizationRepository.save(any(Organization.class)))
                .thenAnswer(inv -> {
                    Organization o = inv.getArgument(0);
                    return o;
                });
        when(passwordEncoder.encode(request.password())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateToken(any(), any(), any(), any())).thenReturn("token123");
        when(jwtUtil.generateRefreshToken(any(), any())).thenReturn("refresh123");

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isEqualTo("token123");
        assertThat(response.role()).isEqualTo("ADMIN");
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already registered");
    }
}
