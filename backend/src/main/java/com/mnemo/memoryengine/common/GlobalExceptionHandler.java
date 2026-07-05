package com.mnemo.memoryengine.common;

import com.mnemo.memoryengine.cognee.exception.CogneeApiException;
import com.mnemo.memoryengine.cognee.exception.CogneeConnectionException;
import com.mnemo.memoryengine.cognee.exception.CogneeException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request: " + ex.getMessage()));
    }

    @ExceptionHandler({UnauthorizedException.class, BadCredentialsException.class})
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, errors, "Validation failed", java.time.Instant.now()));
    }

    @ExceptionHandler(CogneeApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleCogneeApi(CogneeApiException ex) {
        HttpStatus status = ex.getStatusCode() >= 500 ? HttpStatus.BAD_GATEWAY : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(CogneeConnectionException.class)
    public ResponseEntity<ApiResponse<Void>> handleCogneeConnection(CogneeConnectionException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Cognee service unavailable: " + ex.getMessage()));
    }

    @ExceptionHandler(CogneeException.class)
    public ResponseEntity<ApiResponse<Void>> handleCognee(CogneeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Cognee error: " + ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal error: " + ex.getMessage()));
    }
}
