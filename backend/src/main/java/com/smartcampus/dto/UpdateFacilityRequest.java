package com.smartcampus.dto;

import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.FacilityStatus;
import com.smartcampus.model.FacilityType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for updating an existing facility.
 * All fields are optional — only provided fields will be updated (partial
 * update).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFacilityRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    private FacilityType type;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 10000, message = "Capacity must not exceed 10,000")
    private Integer capacity;

    @Size(min = 2, max = 200, message = "Location must be between 2 and 200 characters")
    private String location;

    private FacilityStatus status;

    private List<AvailabilityWindow> availabilityWindows;

    private String imageUrl;

    @Min(value = 0, message = "Map X coordinate must be between 0 and 100")
    @Max(value = 100, message = "Map X coordinate must be between 0 and 100")
    private Double mapX;

    @Min(value = 0, message = "Map Y coordinate must be between 0 and 100")
    @Max(value = 100, message = "Map Y coordinate must be between 0 and 100")
    private Double mapY;
}
