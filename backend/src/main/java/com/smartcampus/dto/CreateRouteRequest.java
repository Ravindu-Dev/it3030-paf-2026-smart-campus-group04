package com.smartcampus.dto;

import com.smartcampus.model.RouteStop;
import com.smartcampus.model.ScheduleEntry;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRouteRequest {
    @NotBlank(message = "Route name is required")
    private String name;
    private String description;
    private List<RouteStop> stops;
    private List<ScheduleEntry> schedule;
    private String color;
}
