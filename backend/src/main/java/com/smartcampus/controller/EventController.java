package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.EventDto;
import com.smartcampus.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Event management.
 */
@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // --- Admin Endpoints ---

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<EventDto>> createEvent(@RequestBody EventDto eventDto) {
        EventDto created = eventService.createEvent(eventDto);
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<EventDto>> updateEvent(@PathVariable String id, @RequestBody EventDto eventDto) {
        EventDto updated = eventService.updateEvent(id, eventDto);
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancelEvent(@PathVariable String id) {
        eventService.cancelEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event cancelled successfully", null));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<EventDto>>> getAllEventsForAdmin() {
        List<EventDto> events = eventService.getAllEventsForAdmin();
        return ResponseEntity.ok(ApiResponse.success("Events fetched successfully", events));
    }

    // --- User Endpoints ---

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventDto>>> getAllEvents(@RequestParam(defaultValue = "false") boolean includePast) {
        List<EventDto> events = eventService.getAllEvents(includePast);
        return ResponseEntity.ok(ApiResponse.success("Events fetched successfully", events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDto>> getEventById(@PathVariable String id) {
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success("Event fetched successfully", event));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Void>> registerForEvent(@PathVariable String id) {
        eventService.registerForEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Registered for event successfully", null));
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelRegistration(@PathVariable String id) {
        eventService.cancelRegistration(id);
        return ResponseEntity.ok(ApiResponse.success("Registration cancelled successfully", null));
    }

    @GetMapping("/my-events")
    public ResponseEntity<ApiResponse<List<EventDto>>> getMyEvents() {
        List<EventDto> events = eventService.getUserRegisteredEvents();
        return ResponseEntity.ok(ApiResponse.success("Your registered events fetched successfully", events));
    }

    @GetMapping("/my-count")
    public ResponseEntity<ApiResponse<Long>> getMyEventsCount() {
        long count = eventService.getUpcomingRegisteredEventsCount();
        return ResponseEntity.ok(ApiResponse.success("Your upcoming registered events count fetched successfully", count));
    }
}
