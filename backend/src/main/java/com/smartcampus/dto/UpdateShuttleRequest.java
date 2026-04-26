package com.smartcampus.dto;

import com.smartcampus.model.ShuttleStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating an existing shuttle.
 * All fields are optional — only provided fields will be updated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShuttleRequest {

    @Size(min = 2, max = 100, message = "Shuttle name must be between 2 and 100 characters")
    private String name;

    @Size(min = 2, max = 20, message = "Plate number must be between 2 and 20 characters")
    private String plateNumber;

    @Size(max = 100, message = "Driver name must not exceed 100 characters")
    private String driverName;

    @Pattern(regexp = "^$|^[0-9+\\-\\s()]{7,20}$", message = "Please enter a valid phone number")
    private String driverPhone;

    private ShuttleStatus status;

    private String routeId;

    private String imageUrl;
}
