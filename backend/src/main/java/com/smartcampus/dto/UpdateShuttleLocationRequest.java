package com.smartcampus.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating shuttle GPS location from driver's phone.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShuttleLocationRequest {

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @DecimalMin(value = "0.0", message = "Heading must be between 0 and 360")
    @DecimalMax(value = "360.0", message = "Heading must be between 0 and 360")
    private Double heading;

    @DecimalMin(value = "0.0", message = "Speed cannot be negative")
    private Double speed;
}
