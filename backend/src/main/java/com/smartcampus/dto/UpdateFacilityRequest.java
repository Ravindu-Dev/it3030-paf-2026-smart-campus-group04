package com.smartcampus.dto;

import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.FacilityStatus;
import com.smartcampus.model.FacilityType;
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

    private String name;

    private FacilityType type;

    private String description;

    private Integer capacity;

    private String location;

    private FacilityStatus status;

    private List<AvailabilityWindow> availabilityWindows;

    private String imageUrl;
}
