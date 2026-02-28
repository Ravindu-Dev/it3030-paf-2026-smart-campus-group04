package com.smartcampus.dto;

import com.smartcampus.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Safe projection of the User entity to expose via API responses.
 * Excludes internal fields like providerId for security.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private String id;
    private String email;
    private String name;
    private String profilePicture;
    private Role role;
    private String phoneNumber;
    private String provider;
    private String createdAt;
}
