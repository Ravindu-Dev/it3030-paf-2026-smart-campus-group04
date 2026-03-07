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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "routes")
public class Route {

    @Id
    private String id;

    private String name;
    private String description;

    private List<RouteStop> stops = new ArrayList<>();
    private List<ScheduleEntry> schedule = new ArrayList<>();

    /** Hex color for the map polyline, e.g. "#3b82f6" */
    private String color = "#3b82f6";

    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
