package com.smartcampus.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smartcampus.config.JwtTokenProvider;
import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.UserDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Service handling all authentication operations.
 *
 * <p>
 * Auth flow for Google OAuth:
 * </p>
 * <ol>
 * <li>Frontend sends Google ID token (credential) to POST /api/auth/google</li>
 * <li>This service verifies the token with Google's API</li>
 * <li>If valid, looks up or creates the user in MongoDB</li>
 * <li>Generates our own JWT for subsequent API calls</li>
 * <li>Returns the JWT + user profile to the frontend</li>
 * </ol>
 */
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public AuthService(
            UserRepository userRepository,
            JwtTokenProvider jwtTokenProvider,
            @Value("${app.google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;

        // Set up Google token verifier with our Client ID
        this.googleIdTokenVerifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    /**
     * Authenticate a user with a Google OAuth credential token.
     *
     * @param googleCredential the Google ID token from the frontend
     * @return AuthResponse containing our JWT and user profile
     * @throws Exception if the Google token is invalid
     */
    public AuthResponse authenticateWithGoogle(String googleCredential) throws Exception {
        // 1. Verify the Google token
        GoogleIdToken idToken = googleIdTokenVerifier.verify(googleCredential);

        if (idToken == null) {
            throw new IllegalArgumentException("Invalid Google token. Authentication failed.");
        }

        // 2. Extract user info from the verified token
        GoogleIdToken.Payload payload = idToken.getPayload();
        String googleId = payload.getSubject(); // Unique Google user ID
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        logger.info("Google OAuth login for: {} ({})", email, googleId);

        // 3. Find existing user or create a new one
        User user = userRepository.findByProviderId(googleId)
                .orElseGet(() -> {
                    // First-time login — create a new user with default role
                    logger.info("Creating new user account for: {}", email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProfilePicture(pictureUrl);
                    newUser.setRole(Role.USER); // Default role
                    newUser.setProvider("google");
                    newUser.setProviderId(googleId);
                    return userRepository.save(newUser);
                });

        // Update profile picture and name in case they changed on Google's side
        user.setProfilePicture(pictureUrl);
        user.setName(name);
        user = userRepository.save(user);

        // 4. Generate our own JWT
        String token = jwtTokenProvider.generateToken(user.getId());

        // 5. Return JWT + user profile
        return new AuthResponse(token, mapToDto(user));
    }

    /**
     * Get the currently authenticated user's profile.
     */
    public UserDto getCurrentUser(User user) {
        return mapToDto(user);
    }

    /**
     * Update the authenticated user's name.
     */
    public UserDto updateProfile(User user, String newName) {
        user.setName(newName);
        User updatedUser = userRepository.save(user);
        return mapToDto(updatedUser);
    }

    /**
     * Delete the authenticated user's account.
     */
    public void deleteAccount(User user) {
        userRepository.deleteById(user.getId());
        logger.info("User account deleted: {} ({})", user.getEmail(), user.getId());
    }

    /**
     * Map a User entity to a safe UserDto (excludes internal fields).
     */
    public UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setRole(user.getRole());
        dto.setProvider(user.getProvider());
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return dto;
    }
}
