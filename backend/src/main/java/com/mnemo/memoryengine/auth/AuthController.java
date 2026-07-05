package com.mnemo.memoryengine.auth;

import com.mnemo.memoryengine.auth.dto.AuthResponse;
import com.mnemo.memoryengine.auth.dto.LoginRequest;
import com.mnemo.memoryengine.auth.dto.RefreshRequest;
import com.mnemo.memoryengine.auth.dto.RegisterRequest;
import com.mnemo.memoryengine.common.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.register(request), "Registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request), "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(request.refreshToken()), "Token refreshed"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                      @RequestBody(required = false) RefreshRequest request) {
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : null;
        String refreshToken = request != null ? request.refreshToken() : null;
        authService.logout(accessToken, refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out"));
    }
}
