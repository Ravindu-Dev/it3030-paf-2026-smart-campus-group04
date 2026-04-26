package com.smartcampus.dto;

import com.smartcampus.model.RouteStop;
import com.smartcampus.model.ScheduleEntry;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating a new route.
 * Uses Jakarta Bean Validation annotations for input validation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRouteRequest {

    @NotBlank(message = "Route name is required")
    @Size(min = 2, max = 100, message = "Route name must be between 2 and 100 characters")
    private String name;

    @Size(max = 300, message = "Description must not exceed 300 characters")
    private String description;

    @Size(min = 2, message = "A route must have at least 2 stops")
    private List<RouteStop> stops;

    private List<ScheduleEntry> schedule;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Color must be a valid hex color (e.g. #3b82f6)")
    private String color;
}
