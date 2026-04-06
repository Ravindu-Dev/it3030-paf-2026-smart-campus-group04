package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteDto>>> getAllRoutes() {
        return ResponseEntity.ok(ApiResponse.success("Routes retrieved", routeService.getAllRoutes()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteDto>> getRouteById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Route retrieved", routeService.getRouteById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RouteDto>> createRoute(@Valid @RequestBody CreateRouteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Route created", routeService.createRoute(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RouteDto>> updateRoute(@PathVariable String id,
            @Valid @RequestBody UpdateRouteRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Route updated", routeService.updateRoute(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable String id) {
        routeService.deleteRoute(id);
        return ResponseEntity.ok(ApiResponse.success("Route deleted"));
    }
}
