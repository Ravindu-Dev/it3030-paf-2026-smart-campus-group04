package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for Google OAuth login.
 * The credential field contains the Google ID token (JWT) received
 * from the @react-oauth/google library on the frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @NotBlank(message = "Google credential token is required")
    private String credential;
}
