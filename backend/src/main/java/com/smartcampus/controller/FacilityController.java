package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.CreateFacilityRequest;
import com.smartcampus.dto.FacilityDto;
import com.smartcampus.dto.UpdateFacilityRequest;
import com.smartcampus.model.FacilityStatus;
import com.smartcampus.model.FacilityType;
import com.smartcampus.service.FacilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the Facilities &amp; Assets Catalogue (Module A).
 *
 * <p>
 * Endpoints:
 * </p>
 * <ul>
 * <li>GET /api/facilities — List/search/filter all facilities
 * (authenticated)</li>
 * <li>GET /api/facilities/{id} — Get a single facility (authenticated)</li>
 * <li>POST /api/facilities — Create a new facility (ADMIN only)</li>
 * <li>PUT /api/facilities/{id} — Update a facility (ADMIN only)</li>
 * <li>DELETE /api/facilities/{id} — Delete a facility (ADMIN only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    /**
     * GET /api/facilities — List all facilities with optional filters.
     *
     * Query parameters (all optional):
     * ?type=LAB
     * ?status=ACTIVE
     * ?location=Building A
     * ?minCapacity=50
     * ?search=Room
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDto>>> getAllFacilities(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) FacilityStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String search) {

        List<FacilityDto> facilities = facilityService.getAllFacilities(
                type, status, location, minCapacity, search);

        return ResponseEntity.ok(
                ApiResponse.success("Facilities retrieved successfully", facilities));
    }

    /**
     * GET /api/facilities/{id} — Get a single facility by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDto>> getFacilityById(@PathVariable String id) {

        FacilityDto facility = facilityService.getFacilityById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Facility retrieved successfully", facility));
    }

    /**
     * POST /api/facilities — Create a new facility.
     * Restricted to ADMIN role.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacilityDto>> createFacility(
            @Valid @RequestBody CreateFacilityRequest request,
            Authentication authentication) {

        String userId = authentication.getName();
        FacilityDto created = facilityService.createFacility(request, userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Facility created successfully", created));
    }

    /**
     * PUT /api/facilities/{id} — Update an existing facility.
     * Restricted to ADMIN role.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacilityDto>> updateFacility(
            @PathVariable String id,
            @Valid @RequestBody UpdateFacilityRequest request) {

        FacilityDto updated = facilityService.updateFacility(id, request);

        return ResponseEntity.ok(
                ApiResponse.success("Facility updated successfully", updated));
    }

    /**
     * DELETE /api/facilities/{id} — Delete a facility.
     * Restricted to ADMIN role.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(@PathVariable String id) {

        facilityService.deleteFacility(id);

        return ResponseEntity.ok(
                ApiResponse.success("Facility deleted successfully"));
    }
}
