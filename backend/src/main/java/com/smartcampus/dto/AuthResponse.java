package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body for successful authentication.
 * Contains the JWT token and the authenticated user's profile.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private UserDto user;
}
