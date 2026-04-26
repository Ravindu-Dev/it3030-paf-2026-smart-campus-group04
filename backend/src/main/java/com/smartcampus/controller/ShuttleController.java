package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.service.ShuttleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the Transport Tracking (Module B).
 * 
 * <p>
 * Endpoints for managing and tracking shuttles across the campus.
 * Supports both admin management endpoints and public tracking endpoints
 * for drivers to update their live location.
 * </p>
 */
@RestController
@RequestMapping("/shuttles")
public class ShuttleController {

    private final ShuttleService shuttleService;

    public ShuttleController(ShuttleService shuttleService) {
        this.shuttleService = shuttleService;
    }

    /**
     * GET /api/shuttles — Retrieve all shuttles.
     * 
     * @return a list of all shuttles
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ShuttleDto>>> getAllShuttles() {
        return ResponseEntity.ok(ApiResponse.success("Shuttles retrieved", shuttleService.getAllShuttles()));
    }

    /**
     * GET /api/shuttles/{id} — Retrieve a specific shuttle by its ID.
     * 
     * @param id the shuttle ID
     * @return the requested shuttle details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShuttleDto>> getShuttleById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Shuttle retrieved", shuttleService.getShuttleById(id)));
    }

    /**
     * POST /api/shuttles — Create a new shuttle.
     * Restricted to ADMIN role.
     * 
     * @param request the shuttle creation request
     * @return the created shuttle
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShuttleDto>> createShuttle(@Valid @RequestBody CreateShuttleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shuttle created", shuttleService.createShuttle(request)));
    }

    /**
     * PUT /api/shuttles/{id} — Update an existing shuttle.
     * Restricted to ADMIN role.
     * 
     * @param id the shuttle ID
     * @param request the updated shuttle data
     * @return the updated shuttle
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShuttleDto>> updateShuttle(@PathVariable String id,
            @Valid @RequestBody UpdateShuttleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Shuttle updated", shuttleService.updateShuttle(id, request)));
    }

    /**
     * DELETE /api/shuttles/{id} — Delete a shuttle.
     * Restricted to ADMIN role.
     * 
     * @param id the shuttle ID
     * @return a success response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShuttle(@PathVariable String id) {
        shuttleService.deleteShuttle(id);
        return ResponseEntity.ok(ApiResponse.success("Shuttle deleted"));
    }

    // ─── Driver Tracking (PUBLIC — no login) ────────────────────────

    /**
     * GET /api/shuttles/track/{token} — Retrieve shuttle details by tracking token.
     * Used by the driver application.
     * 
     * @param token the public tracking token
     * @return the shuttle details
     */
    @GetMapping("/track/{token}")
    public ResponseEntity<ApiResponse<ShuttleDto>> getShuttleByToken(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.success("Shuttle retrieved", shuttleService.getShuttleByToken(token)));
    }

    /**
     * PATCH /api/shuttles/track/{token} — Update the live location of a shuttle.
     * Used by the driver application.
     * 
     * @param token the public tracking token
     * @param request the location update request
     * @return the updated shuttle details
     */
    @PatchMapping("/track/{token}")
    public ResponseEntity<ApiResponse<ShuttleDto>> updateLocation(@PathVariable String token,
            @Valid @RequestBody UpdateShuttleLocationRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Location updated", shuttleService.updateLocationByToken(token, request)));
    }

    /**
     * PATCH /api/shuttles/track/{token}/stop — Stop tracking a shuttle.
     * Sets the status to inactive or clears the token.
     * 
     * @param token the public tracking token
     * @return the updated shuttle details
     */
    @PatchMapping("/track/{token}/stop")
    public ResponseEntity<ApiResponse<ShuttleDto>> stopTracking(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.success("Tracking stopped", shuttleService.stopTracking(token)));
    }
}
