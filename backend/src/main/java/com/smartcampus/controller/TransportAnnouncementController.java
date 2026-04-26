package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.CreateAnnouncementRequest;
import com.smartcampus.dto.TransportAnnouncementDto;
import com.smartcampus.service.TransportAnnouncementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transport-announcements")
public class TransportAnnouncementController {

    private final TransportAnnouncementService service;

    public TransportAnnouncementController(TransportAnnouncementService service) {
        this.service = service;
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<TransportAnnouncementDto>> getActiveAnnouncement() {
        TransportAnnouncementDto active = service.getActiveAnnouncement();
        if (active == null) {
            return ResponseEntity.ok(ApiResponse.success("No active announcement", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Active announcement retrieved", active));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransportAnnouncementDto>> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request) {
        TransportAnnouncementDto created = service.createAnnouncement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Announcement broadcasted successfully", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateAnnouncement(@PathVariable String id) {
        service.deactivateAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deactivated successfully", null));
    }
}
