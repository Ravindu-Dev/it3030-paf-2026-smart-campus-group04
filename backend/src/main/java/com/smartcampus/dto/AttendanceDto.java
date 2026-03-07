package com.smartcampus.dto;

import com.smartcampus.model.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for attendance record API responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {

    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private AttendanceStatus status;
    private String markedAt;
    private String markedBy;
    private String markedByName;
    private String location;
    private String notes;
    private String createdAt;
}
