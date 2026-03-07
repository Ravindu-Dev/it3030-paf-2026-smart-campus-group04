package com.smartcampus.service;

import com.smartcampus.dto.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Route;
import com.smartcampus.repository.RouteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<RouteDto> getAllRoutes() {
        return routeRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public RouteDto getRouteById(String id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route", "id", id));
        return toDto(route);
    }

    public RouteDto createRoute(CreateRouteRequest request) {
        Route route = new Route();
        route.setName(request.getName());
        route.setDescription(request.getDescription());
        route.setStops(request.getStops() != null ? request.getStops() : List.of());
        route.setSchedule(request.getSchedule() != null ? request.getSchedule() : List.of());
        route.setColor(request.getColor() != null ? request.getColor() : "#3b82f6");
        route.setActive(true);
        return toDto(routeRepository.save(route));
    }

    public RouteDto updateRoute(String id, UpdateRouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route", "id", id));
        if (request.getName() != null)
            route.setName(request.getName());
        if (request.getDescription() != null)
            route.setDescription(request.getDescription());
        if (request.getStops() != null)
            route.setStops(request.getStops());
        if (request.getSchedule() != null)
            route.setSchedule(request.getSchedule());
        if (request.getColor() != null)
            route.setColor(request.getColor());
        if (request.getActive() != null)
            route.setActive(request.getActive());
        return toDto(routeRepository.save(route));
    }

    public void deleteRoute(String id) {
        if (!routeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Route", "id", id);
        }
        routeRepository.deleteById(id);
    }

    public RouteDto toDto(Route route) {
        RouteDto dto = new RouteDto();
        dto.setId(route.getId());
        dto.setName(route.getName());
        dto.setDescription(route.getDescription());
        dto.setStops(route.getStops());
        dto.setSchedule(route.getSchedule());
        dto.setColor(route.getColor());
        dto.setActive(route.isActive());
        dto.setCreatedAt(route.getCreatedAt());
        dto.setUpdatedAt(route.getUpdatedAt());
        return dto;
    }
}
