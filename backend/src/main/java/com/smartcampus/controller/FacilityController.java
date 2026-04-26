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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

        private static final Logger logger = LoggerFactory.getLogger(FacilityController.class);
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
                        @RequestParam(name = "type", required = false) FacilityType type,
                        @RequestParam(name = "status", required = false) FacilityStatus status,
                        @RequestParam(name = "location", required = false) String location,
                        @RequestParam(name = "minCapacity", required = false) Integer minCapacity,
                        @RequestParam(name = "search", required = false) String search) {

                logger.info("Fetching facilities with filters: type={}, status={}, location={}, search={}", type, status, location, search);
                List<FacilityDto> facilities = facilityService.getAllFacilities(
                                type, status, location, minCapacity, search);

                return ResponseEntity.ok(
                                ApiResponse.success("Facilities retrieved successfully", facilities));
        }

        /**
         * GET /api/facilities/{id} — Get a single facility by ID.
         */
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<FacilityDto>> getFacilityById(@PathVariable(name = "id") String id) {

                logger.info("Fetching facility details for id: {}", id);
                FacilityDto facility = facilityService.getFacilityById(id);

                return ResponseEntity.ok(
                                ApiResponse.success("Facility retrieved successfully", facility));
        }

        /**
         * POST /api/facilities — Create a new facility.
         * Restricted to ADMIN role.
         */
        @PostMapping
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
        public ResponseEntity<ApiResponse<FacilityDto>> createFacility(
                        @Valid @RequestBody CreateFacilityRequest request,
                        Authentication authentication) {

                String userId = authentication.getName();
                logger.info("User {} is creating a new facility of type: {}", userId, request.getType());
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
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
        public ResponseEntity<ApiResponse<FacilityDto>> updateFacility(
                        @PathVariable(name = "id") String id,
                        @Valid @RequestBody UpdateFacilityRequest request) {

                logger.info("Updating facility id: {}", id);
                FacilityDto updated = facilityService.updateFacility(id, request);

                return ResponseEntity.ok(
                                ApiResponse.success("Facility updated successfully", updated));
        }

        /**
         * DELETE /api/facilities/{id} — Delete a facility.
         * Restricted to ADMIN role.
         */
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
        public ResponseEntity<ApiResponse<Void>> deleteFacility(@PathVariable(name = "id") String id) {

                logger.info("Deleting facility id: {}", id);
                facilityService.deleteFacility(id);

                return ResponseEntity.ok(
                                ApiResponse.success("Facility deleted successfully"));
        }
}
