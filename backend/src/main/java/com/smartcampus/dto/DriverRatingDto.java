package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverRatingDto {
    private String id;
    private String shuttleId;
    private Integer rating;
    private String comment;
    private String userId;
    private LocalDateTime createdAt;
}
