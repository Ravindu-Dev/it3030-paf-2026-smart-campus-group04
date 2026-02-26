package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a user in the Smart Campus system.
 * Users are created automatically on first Google OAuth login.
 *
 * <p>
 * Stored in the "users" collection.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    /** User's email address (unique, from Google profile) */
    @Indexed(unique = true)
    private String email;

    /** Display name (from Google profile, editable by user) */
    private String name;

    /** Profile picture URL (from Google profile) */
    private String profilePicture;

    /** User's role — defaults to USER on first login */
    private Role role = Role.USER;

    /** OAuth provider name (e.g., "google") */
    private String provider;

    /** Unique ID from the OAuth provider (Google sub claim) */
    @Indexed(unique = true)
    private String providerId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
