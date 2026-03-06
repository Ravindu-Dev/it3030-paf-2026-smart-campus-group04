package com.smartcampus.dto;

import com.smartcampus.model.EventStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Data Transfer Object for Event.
 */
@Data
public class EventDto {
    private String id;
    private String title;
    private String description;
    private String location;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int capacity;
    private int participantCount;
    private String imageUrl;
    private EventStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private boolean isRegistered; // Helper field for user view
}
