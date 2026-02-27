package com.smartcampus.exception;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.exception.BookingConflictException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler that ensures all API errors return a consistent
 * {@link ApiResponse} JSON structure, including authentication/authorization
 * errors.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

        /**
         * Handle bean validation errors (e.g., @NotBlank, @Email, @Size).
         * Returns a map of field → error message as the response data.
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
                        MethodArgumentNotValidException ex) {

                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getAllErrors().forEach(error -> {
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        errors.put(fieldName, errorMessage);
                });

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error("Validation failed", errors));
        }

        /**
         * Handle custom resource-not-found exceptions.
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
                        ResourceNotFoundException ex) {

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Handle authentication failures (invalid/missing JWT).
         * Returns 401 Unauthorized.
         */
        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
                        AuthenticationException ex) {

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ApiResponse.error("Authentication required. Please log in."));
        }

        /**
         * Handle authorization failures (insufficient permissions/role).
         * Returns 403 Forbidden.
         */
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
                        AccessDeniedException ex) {

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error(
                                                "Access denied. You don't have permission to perform this action."));
        }

        /**
         * Handle booking conflict exceptions (overlapping time ranges).
         * Returns 409 Conflict.
         */
        @ExceptionHandler(BookingConflictException.class)
        public ResponseEntity<ApiResponse<Void>> handleBookingConflictException(
                        BookingConflictException ex) {

                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Handle illegal argument exceptions.
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(
                        IllegalArgumentException ex) {

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ApiResponse.error(ex.getMessage()));
        }

        /**
         * Fallback handler for any unhandled exceptions.
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
                // Log the stack trace to the console for debugging
                ex.printStackTrace();

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
        }
}
