package com.smartcampus.dto;

import com.smartcampus.model.ShuttleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShuttleDto {
    private String id;
    private String name;
    private String plateNumber;
    private String driverName;
    private String driverPhone;
    private ShuttleStatus status;
    private String routeId;
    private String trackingToken;
    private Double currentLatitude;
    private Double currentLongitude;
    private Double heading;
    private Double speed;
    private LocalDateTime lastLocationUpdate;
    private boolean isTracking;
    private String imageUrl;
    private Double averageRating;
    private Integer totalRatings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private RouteDto route;
}
