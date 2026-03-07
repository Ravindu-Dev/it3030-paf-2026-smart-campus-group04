package com.smartcampus.dto;

import com.smartcampus.model.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for marking attendance via QR scan.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkAttendanceRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    /** Defaults to PRESENT if not specified */
    private AttendanceStatus status;

    /** Optional scan location */
    private String location;

    /** Optional notes */
    private String notes;
}
