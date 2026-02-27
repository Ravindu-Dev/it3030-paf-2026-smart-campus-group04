package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.UpdateRoleRequest;
import com.smartcampus.dto.UserDto;
import com.smartcampus.model.Role;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin user management.
 *
 * <p>
 * All endpoints are restricted to ADMIN role via @PreAuthorize.
 * </p>
 *
 * <p>
 * Endpoints:
 * </p>
 * <ul>
 * <li>GET /api/users — List all users (optional role filter)</li>
 * <li>PUT /api/users/{id}/role — Update a user's role</li>
 * </ul>
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users — Get all users with optional role filter.
     *
     * Usage:
     * GET /api/users → all users
     * GET /api/users?role=ADMIN → only admins
     *
     * Restricted to ADMIN role.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(
            @RequestParam(required = false) Role role) {

        List<UserDto> users = userService.getAllUsers(role);

        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", users));
    }

    /**
     * GET /api/users/technicians — Get all users with TECHNICIAN role.
     *
     * Used for technician assignment in maintenance tickets.
     * Accessible by ADMIN and MANAGER roles.
     */
    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getTechnicians() {
        List<UserDto> technicians = userService.getAllUsers(Role.TECHNICIAN);

        return ResponseEntity.ok(
                ApiResponse.success("Technicians retrieved successfully", technicians));
    }

    /**
     * PUT /api/users/{id}/role — Update a user's role.
     *
     * Restricted to ADMIN role.
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable String id,
            @Valid @RequestBody UpdateRoleRequest request) {

        UserDto updatedUser = userService.updateUserRole(id, request.getRole());

        return ResponseEntity.ok(
                ApiResponse.success("User role updated successfully", updatedUser));
    }
}
