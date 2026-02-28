package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication and user profile operations.
 *
 * <p>
 * Endpoints:
 * </p>
 * <ul>
 * <li>POST /api/auth/google — Login with Google OAuth (public)</li>
 * <li>GET /api/auth/me — Get current user profile (requires JWT)</li>
 * <li>PUT /api/auth/profile — Update current user's name (requires JWT)</li>
 * <li>DELETE /api/auth/account — Delete current user's account (requires
 * JWT)</li>
 * </ul>
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/google — Authenticate with Google OAuth.
     *
     * Receives the Google ID token from the frontend, verifies it,
     * creates/finds the user, and returns our JWT token + user profile.
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleAuthRequest request) throws Exception {

        AuthResponse authResponse = authService.authenticateWithGoogle(request.getCredential());

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", authResponse));
    }

    /**
     * GET /api/auth/me — Get the currently authenticated user's profile.
     *
     * The @AuthenticationPrincipal annotation injects the User object
     * that was set in the SecurityContext by JwtAuthenticationFilter.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(
            @AuthenticationPrincipal User user) {

        UserDto userDto = authService.getCurrentUser(user);

        return ResponseEntity.ok(
                ApiResponse.success("User profile retrieved", userDto));
    }

    /**
     * PUT /api/auth/profile — Update the authenticated user's profile.
     *
     * Currently supports updating the display name only.
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserDto updatedUser = authService.updateProfile(user, request.getName(), request.getPhoneNumber());

        return ResponseEntity.ok(
                ApiResponse.success("Profile updated successfully", updatedUser));
    }

    /**
     * DELETE /api/auth/account — Delete the authenticated user's account.
     *
     * This action is irreversible. The user's JWT becomes invalid
     * immediately since the user no longer exists in the database.
     */
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal User user) {

        authService.deleteAccount(user);

        return ResponseEntity.ok(
                ApiResponse.success("Account deleted successfully"));
    }
}
