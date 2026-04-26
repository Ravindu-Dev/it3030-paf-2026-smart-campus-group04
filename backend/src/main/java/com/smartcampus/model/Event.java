package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * MongoDB document representing an Event in the Smart Campus system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "events")
public class Event {

    @Id
    private String id;
    
    private String title;
    private String description;
    private String location;
    private LocalDate eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int capacity;
    private int participantCount = 0;
    private String imageUrl;
    private EventType type = EventType.EVENT;
    private EventStatus status = EventStatus.UPCOMING;
    
    private String createdBy; // User ID of the admin who created the event
    
    @CreatedDate
    private LocalDateTime createdAt;
}
