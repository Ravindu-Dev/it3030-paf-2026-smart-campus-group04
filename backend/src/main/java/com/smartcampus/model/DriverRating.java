package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "driver_ratings")
public class DriverRating {

    @Id
    private String id;

    @Indexed
    private String shuttleId;

    private Integer rating; // 1 to 5
    
    private String comment;

    // Optional user ID if the user is logged in
    private String userId;

    @CreatedDate
    private LocalDateTime createdAt;
}
