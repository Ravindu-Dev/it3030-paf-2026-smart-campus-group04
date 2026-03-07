package com.smartcampus.dto;

import com.smartcampus.model.RouteStop;
import com.smartcampus.model.ScheduleEntry;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDto {
    private String id;
    private String name;
    private String description;
    private List<RouteStop> stops;
    private List<ScheduleEntry> schedule;
    private String color;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
