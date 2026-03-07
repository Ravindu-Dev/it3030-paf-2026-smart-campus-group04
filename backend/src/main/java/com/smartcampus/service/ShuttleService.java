package com.smartcampus.service;

import com.smartcampus.dto.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Shuttle;
import com.smartcampus.model.ShuttleStatus;
import com.smartcampus.repository.ShuttleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShuttleService {

    private final ShuttleRepository shuttleRepository;
    private final RouteService routeService;

    public ShuttleService(ShuttleRepository shuttleRepository, RouteService routeService) {
        this.shuttleRepository = shuttleRepository;
        this.routeService = routeService;
    }

    public List<ShuttleDto> getAllShuttles() {
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

    public ShuttleDto createShuttle(CreateShuttleRequest request) {
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

    public ShuttleDto updateShuttle(String id, UpdateShuttleRequest request) {
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

    public void deleteShuttle(String id) {
        if (!shuttleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Shuttle", "id", id);
        }
        shuttleRepository.deleteById(id);
    }

    public ShuttleDto updateLocationByToken(String token, UpdateShuttleLocationRequest request) {
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
