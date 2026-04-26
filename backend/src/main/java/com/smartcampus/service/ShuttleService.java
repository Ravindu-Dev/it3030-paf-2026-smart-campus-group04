package com.smartcampus.service;

import com.smartcampus.dto.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Shuttle;
import com.smartcampus.model.ShuttleStatus;
import com.smartcampus.repository.ShuttleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for Shuttle management.
 * Handles logic for tracking, CRUD operations, and linking with routes.
 */
@Service
public class ShuttleService {

    private static final Logger logger = LoggerFactory.getLogger(ShuttleService.class);

    private final ShuttleRepository shuttleRepository;
    private final RouteService routeService;

    public ShuttleService(ShuttleRepository shuttleRepository, RouteService routeService) {
        this.shuttleRepository = shuttleRepository;
        this.routeService = routeService;
    }

    /**
     * Retrieve all shuttles.
     * @return a list of all shuttles as DTOs.
     */
    public List<ShuttleDto> getAllShuttles() {
        logger.debug("Retrieving all shuttles from database");
        return shuttleRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ShuttleDto getShuttleById(String id) {
        Shuttle shuttle = shuttleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttle", "id", id));
        return toDto(shuttle);
    }

    public ShuttleDto getShuttleByToken(String token) {
        Shuttle shuttle = shuttleRepository.findByTrackingToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttle", "trackingToken", token));
        return toDto(shuttle);
    }

    /**
     * Create a new shuttle.
     * @param request The shuttle details
     * @return The created shuttle DTO
     */
    public ShuttleDto createShuttle(CreateShuttleRequest request) {
        logger.info("Creating new shuttle: {}", request.getPlateNumber());
        Shuttle shuttle = new Shuttle();
        shuttle.setName(request.getName());
        shuttle.setPlateNumber(request.getPlateNumber());
        shuttle.setDriverName(request.getDriverName());
        shuttle.setDriverPhone(request.getDriverPhone());
        shuttle.setRouteId(request.getRouteId());
        shuttle.setImageUrl(request.getImageUrl());
        shuttle.setStatus(ShuttleStatus.ACTIVE);
        shuttle.setTrackingToken(UUID.randomUUID().toString().substring(0, 8));
        return toDto(shuttleRepository.save(shuttle));
    }

    /**
     * Update an existing shuttle.
     * @param id The ID of the shuttle to update
     * @param request The new shuttle details
     * @return The updated shuttle DTO
     */
    public ShuttleDto updateShuttle(String id, UpdateShuttleRequest request) {
        logger.info("Updating shuttle with ID: {}", id);
        Shuttle shuttle = shuttleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttle", "id", id));
        if (request.getName() != null)
            shuttle.setName(request.getName());
        if (request.getPlateNumber() != null)
            shuttle.setPlateNumber(request.getPlateNumber());
        if (request.getDriverName() != null)
            shuttle.setDriverName(request.getDriverName());
        if (request.getDriverPhone() != null)
            shuttle.setDriverPhone(request.getDriverPhone());
        if (request.getStatus() != null)
            shuttle.setStatus(request.getStatus());
        if (request.getRouteId() != null)
            shuttle.setRouteId(request.getRouteId());
        if (request.getImageUrl() != null)
            shuttle.setImageUrl(request.getImageUrl());
        return toDto(shuttleRepository.save(shuttle));
    }

    /**
     * Delete a shuttle by ID.
     * @param id The ID of the shuttle to delete
     */
    public void deleteShuttle(String id) {
        logger.info("Deleting shuttle with ID: {}", id);
        if (!shuttleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Shuttle", "id", id);
        }
        shuttleRepository.deleteById(id);
    }

    /**
     * Update shuttle location by tracking token.
     * @param token Public tracking token
     * @param request Location updates
     * @return Updated shuttle details
     */
    public ShuttleDto updateLocationByToken(String token, UpdateShuttleLocationRequest request) {
        logger.debug("Updating location for shuttle token: {}", token);
        Shuttle shuttle = shuttleRepository.findByTrackingToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttle", "trackingToken", token));
        shuttle.setCurrentLatitude(request.getLatitude());
        shuttle.setCurrentLongitude(request.getLongitude());
        shuttle.setHeading(request.getHeading());
        shuttle.setSpeed(request.getSpeed());
        shuttle.setLastLocationUpdate(LocalDateTime.now());
        shuttle.setTracking(true);
        return toDto(shuttleRepository.save(shuttle));
    }

    public ShuttleDto stopTracking(String token) {
        Shuttle shuttle = shuttleRepository.findByTrackingToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttle", "trackingToken", token));
        shuttle.setTracking(false);
        return toDto(shuttleRepository.save(shuttle));
    }

    private ShuttleDto toDto(Shuttle shuttle) {
        ShuttleDto dto = new ShuttleDto();
        dto.setId(shuttle.getId());
        dto.setName(shuttle.getName());
        dto.setPlateNumber(shuttle.getPlateNumber());
        dto.setDriverName(shuttle.getDriverName());
        dto.setDriverPhone(shuttle.getDriverPhone());
        dto.setStatus(shuttle.getStatus());
        dto.setRouteId(shuttle.getRouteId());
        dto.setTrackingToken(shuttle.getTrackingToken());
        dto.setCurrentLatitude(shuttle.getCurrentLatitude());
        dto.setCurrentLongitude(shuttle.getCurrentLongitude());
        dto.setHeading(shuttle.getHeading());
        dto.setSpeed(shuttle.getSpeed());
        dto.setLastLocationUpdate(shuttle.getLastLocationUpdate());
        dto.setTracking(shuttle.isTracking());
        dto.setImageUrl(shuttle.getImageUrl());
        dto.setCreatedAt(shuttle.getCreatedAt());
        dto.setUpdatedAt(shuttle.getUpdatedAt());
        if (shuttle.getRouteId() != null) {
            try {
                dto.setRoute(routeService.getRouteById(shuttle.getRouteId()));
            } catch (ResourceNotFoundException e) {
                // Route was deleted
            }
        }
        return dto;
    }
}
