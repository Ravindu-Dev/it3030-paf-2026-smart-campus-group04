package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.service.ShuttleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shuttles")
public class ShuttleController {

    private final ShuttleService shuttleService;

    public ShuttleController(ShuttleService shuttleService) {
        this.shuttleService = shuttleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShuttleDto>>> getAllShuttles() {
        return ResponseEntity.ok(ApiResponse.success("Shuttles retrieved", shuttleService.getAllShuttles()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShuttleDto>> getShuttleById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Shuttle retrieved", shuttleService.getShuttleById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShuttleDto>> createShuttle(@Valid @RequestBody CreateShuttleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shuttle created", shuttleService.createShuttle(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShuttleDto>> updateShuttle(@PathVariable String id,
            @Valid @RequestBody UpdateShuttleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Shuttle updated", shuttleService.updateShuttle(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteShuttle(@PathVariable String id) {
        shuttleService.deleteShuttle(id);
        return ResponseEntity.ok(ApiResponse.success("Shuttle deleted"));
    }

    // ─── Driver Tracking (PUBLIC — no login) ────────────────────────

    @GetMapping("/track/{token}")
    public ResponseEntity<ApiResponse<ShuttleDto>> getShuttleByToken(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.success("Shuttle retrieved", shuttleService.getShuttleByToken(token)));
    }

    @PatchMapping("/track/{token}")
    public ResponseEntity<ApiResponse<ShuttleDto>> updateLocation(@PathVariable String token,
            @Valid @RequestBody UpdateShuttleLocationRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Location updated", shuttleService.updateLocationByToken(token, request)));
    }

    @PatchMapping("/track/{token}/stop")
    public ResponseEntity<ApiResponse<ShuttleDto>> stopTracking(@PathVariable String token) {
        return ResponseEntity.ok(ApiResponse.success("Tracking stopped", shuttleService.stopTracking(token)));
    }
}
