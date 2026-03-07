package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateShuttleRequest {
    @NotBlank(message = "Shuttle name is required")
    private String name;
    @NotBlank(message = "Plate number is required")
    private String plateNumber;
    private String driverName;
    private String driverPhone;
    private String routeId;
    private String imageUrl;
}
