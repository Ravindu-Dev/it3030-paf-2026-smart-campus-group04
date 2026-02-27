package com.smartcampus.dto;

import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.FacilityStatus;
import com.smartcampus.model.FacilityType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for Facility data returned to clients.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDto {
    private String id;
    private String name;
    private FacilityType type;
    private String description;
    private Integer capacity;
    private String location;
    private FacilityStatus status;
    private List<AvailabilityWindow> availabilityWindows;
    private String imageUrl;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
