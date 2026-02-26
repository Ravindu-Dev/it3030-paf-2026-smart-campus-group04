package com.smartcampus.service;

import com.smartcampus.dto.UserDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user management operations (admin-only).
 */
@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    /**
     * Get all users, optionally filtered by role.
     *
     * @param role filter by this role (null = all users)
     * @return list of user DTOs
     */
    public List<UserDto> getAllUsers(Role role) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }
        return users.stream()
                .map(authService::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update a user's role (admin only).
     *
     * @param userId  the user's MongoDB ID
     * @param newRole the new role to assign
     * @return updated user DTO
     */
    public UserDto updateUserRole(String userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        logger.info("Updating role for user {} ({}) from {} to {}",
                user.getEmail(), userId, user.getRole(), newRole);

        user.setRole(newRole);
        User updatedUser = userRepository.save(user);
        return authService.mapToDto(updatedUser);
    }
}
