package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB document representing a bookable campus resource
 * (lecture hall, lab, meeting room, or equipment).
 *
 * <p>
 * Stored in the "facilities" collection.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "facilities")
public class Facility {

    @Id
    private String id;

    /** Human-readable name, e.g. "Room A101", "Projector #3" */
    private String name;

    /** Resource category */
    private FacilityType type;

    /** Free-text description */
    private String description;

    /** Seating/capacity (applicable mostly to rooms; null for equipment) */
    private Integer capacity;

    /** Physical location, e.g. "Building A, Floor 2" */
    private String location;

    /** Current operational status */
    private FacilityStatus status = FacilityStatus.ACTIVE;

    /** Weekly availability windows for booking */
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

    /** Optional image URL */
    private String imageUrl;

    /** ID of the admin who created this facility */
    private String createdBy;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
