package com.smartcampus.service;

import com.smartcampus.dto.CreateFacilityRequest;
import com.smartcampus.dto.FacilityDto;
import com.smartcampus.dto.UpdateFacilityRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Facility;
import com.smartcampus.model.FacilityStatus;
import com.smartcampus.model.FacilityType;
import com.smartcampus.repository.FacilityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Facility (campus resource) management.
 *
 * <p>
 * Handles all business logic: CRUD operations, search, and filtering.
 * </p>
 */
@Service
public class FacilityService {

    private static final Logger logger = LoggerFactory.getLogger(FacilityService.class);

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    // ─── READ ────────────────────────────────────────────────────────────

    /**
     * Get all facilities with optional filters.
     *
     * @param type        filter by facility type (null = all)
     * @param status      filter by status (null = all)
     * @param location    partial-match filter on location (null = all)
     * @param minCapacity minimum capacity filter (null = no minimum)
     * @param search      search by name (partial, case-insensitive)
     * @return filtered list of facility DTOs
     */
    public List<FacilityDto> getAllFacilities(FacilityType type, FacilityStatus status,
            String location, Integer minCapacity, String search) {
        List<Facility> facilities;

        // Apply the most specific filter combination available
        if (search != null && !search.isBlank()) {
            facilities = facilityRepository.findByNameContainingIgnoreCase(search.trim());
        } else if (type != null && status != null) {
            facilities = facilityRepository.findByTypeAndStatus(type, status);
        } else if (type != null) {
            facilities = facilityRepository.findByType(type);
        } else if (status != null) {
            facilities = facilityRepository.findByStatus(status);
        } else if (location != null && !location.isBlank()) {
            facilities = facilityRepository.findByLocationContainingIgnoreCase(location.trim());
        } else if (minCapacity != null) {
            facilities = facilityRepository.findByCapacityGreaterThanEqual(minCapacity);
        } else {
            facilities = facilityRepository.findAll();
        }

        // Apply additional in-memory filters for combined criteria
        if (type != null && search != null && !search.isBlank()) {
            FacilityType filterType = type;
            facilities = facilities.stream()
                    .filter(f -> f.getType() == filterType)
                    .collect(Collectors.toList());
        }
        if (status != null && (search != null || location != null)) {
            FacilityStatus filterStatus = status;
            facilities = facilities.stream()
                    .filter(f -> f.getStatus() == filterStatus)
                    .collect(Collectors.toList());
        }
        if (minCapacity != null && (search != null || type != null || location != null)) {
            Integer filterCap = minCapacity;
            facilities = facilities.stream()
                    .filter(f -> f.getCapacity() != null && f.getCapacity() >= filterCap)
                    .collect(Collectors.toList());
        }
        if (location != null && !location.isBlank() && search != null) {
            String filterLoc = location.trim().toLowerCase();
            facilities = facilities.stream()
                    .filter(f -> f.getLocation() != null
                            && f.getLocation().toLowerCase().contains(filterLoc))
                    .collect(Collectors.toList());
        }

        return facilities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a single facility by its ID.
     *
     * @param id the MongoDB document ID
     * @return facility DTO
     * @throws ResourceNotFoundException if not found
     */
    public FacilityDto getFacilityById(String id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));
        return mapToDto(facility);
    }

    // ─── CREATE ──────────────────────────────────────────────────────────

    /**
     * Create a new facility (admin only).
     *
     * @param request validated creation request
     * @param userId  ID of the admin creating the facility
     * @return created facility DTO
     */
    public FacilityDto createFacility(CreateFacilityRequest request, String userId) {
        Facility facility = new Facility();
        facility.setName(request.getName());
        facility.setType(request.getType());
        facility.setDescription(request.getDescription());
        facility.setCapacity(request.getCapacity());
        facility.setLocation(request.getLocation());
        facility.setStatus(FacilityStatus.ACTIVE);
        facility.setImageUrl(request.getImageUrl());
        facility.setCreatedBy(userId);

        if (request.getAvailabilityWindows() != null) {
            facility.setAvailabilityWindows(request.getAvailabilityWindows());
        }

        Facility saved = facilityRepository.save(facility);
        logger.info("Facility created: {} (id={}) by user {}", saved.getName(), saved.getId(), userId);

        return mapToDto(saved);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────

    /**
     * Update an existing facility (partial update — only provided fields are
     * changed).
     *
     * @param id      the facility ID
     * @param request update request with optional fields
     * @return updated facility DTO
     * @throws ResourceNotFoundException if facility not found
     */
    public FacilityDto updateFacility(String id, UpdateFacilityRequest request) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        // Partial update — only update fields that are provided
        if (request.getName() != null) {
            facility.setName(request.getName());
        }
        if (request.getType() != null) {
            facility.setType(request.getType());
        }
        if (request.getDescription() != null) {
            facility.setDescription(request.getDescription());
        }
        if (request.getCapacity() != null) {
            facility.setCapacity(request.getCapacity());
        }
        if (request.getLocation() != null) {
            facility.setLocation(request.getLocation());
        }
        if (request.getStatus() != null) {
            facility.setStatus(request.getStatus());
        }
        if (request.getAvailabilityWindows() != null) {
            facility.setAvailabilityWindows(request.getAvailabilityWindows());
        }
        if (request.getImageUrl() != null) {
            facility.setImageUrl(request.getImageUrl());
        }

        Facility updated = facilityRepository.save(facility);
        logger.info("Facility updated: {} (id={})", updated.getName(), updated.getId());

        return mapToDto(updated);
    }

    // ─── DELETE ──────────────────────────────────────────────────────────

    /**
     * Delete a facility by its ID (admin only).
     *
     * @param id the facility ID
     * @throws ResourceNotFoundException if facility not found
     */
    public void deleteFacility(String id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        facilityRepository.delete(facility);
        logger.info("Facility deleted: {} (id={})", facility.getName(), id);
    }

    // ─── Mapping ─────────────────────────────────────────────────────────

    /**
     * Map a Facility document to a FacilityDto.
     */
    private FacilityDto mapToDto(Facility facility) {
        FacilityDto dto = new FacilityDto();
        dto.setId(facility.getId());
        dto.setName(facility.getName());
        dto.setType(facility.getType());
        dto.setDescription(facility.getDescription());
        dto.setCapacity(facility.getCapacity());
        dto.setLocation(facility.getLocation());
        dto.setStatus(facility.getStatus());
        dto.setAvailabilityWindows(facility.getAvailabilityWindows());
        dto.setImageUrl(facility.getImageUrl());
        dto.setCreatedBy(facility.getCreatedBy());
        dto.setCreatedAt(facility.getCreatedAt());
        dto.setUpdatedAt(facility.getUpdatedAt());
        return dto;
    }
}
