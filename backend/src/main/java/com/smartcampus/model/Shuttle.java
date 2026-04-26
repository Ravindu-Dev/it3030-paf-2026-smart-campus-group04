package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "shuttles")
public class Shuttle {

    @Id
    private String id;

    private String name;
    private String plateNumber;
    private String driverName;
    private String driverPhone;

    private ShuttleStatus status = ShuttleStatus.ACTIVE;

    /** Reference to Route document */
    private String routeId;

    /** Unique token for driver GPS tracking (no login needed) */
    @Indexed(unique = true)
    private String trackingToken;

    /** Real-time GPS data from driver's phone */
    private Double currentLatitude;
    private Double currentLongitude;
    private Double heading;
    private Double speed;
    private LocalDateTime lastLocationUpdate;
    private boolean isTracking = false;

    private String imageUrl;

    private Double averageRating = 0.0;
    private Integer totalRatings = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
