package com.smartcampus.dto;

import com.smartcampus.model.AvailabilityWindow;
import com.smartcampus.model.FacilityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating a new facility.
 * Uses Jakarta Bean Validation annotations for input validation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFacilityRequest {

    @NotBlank(message = "Facility name is required")
    private String name;

    @NotNull(message = "Facility type is required")
    private FacilityType type;

    private String description;

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private List<AvailabilityWindow> availabilityWindows;

    private String imageUrl;
}
