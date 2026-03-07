package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing an attendance record.
 * Created when a student/staff QR code is scanned.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    /** The user whose attendance was marked */
    private String userId;

    /** Denormalized user name for quick display */
    private String userName;

    /** Denormalized user email for quick display */
    private String userEmail;

    /** Attendance status */
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    /** When the attendance was marked */
    private LocalDateTime markedAt;

    /** ID of the user who scanned/marked the attendance */
    private String markedBy;

    /** Name of the person who marked attendance */
    private String markedByName;

    /** Optional location where QR was scanned */
    private String location;

    /** Optional notes */
    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;
}
