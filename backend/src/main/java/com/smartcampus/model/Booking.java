package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * MongoDB document representing a booking request for a campus resource.
 *
 * <p>
 * Stored in the "bookings" collection.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    /** ID of the facility being booked */
    private String facilityId;

    /** Denormalized facility name for display without joins */
    private String facilityName;

    /** ID of the user who made the booking */
    private String userId;

    /** Denormalized user name for display */
    private String userName;

    /** Denormalized user email for display */
    private String userEmail;

    /** Date of the booking */
    private LocalDate bookingDate;

    /** Start time of the booking slot */
    private LocalTime startTime;

    /** End time of the booking slot */
    private LocalTime endTime;

    /** Purpose / reason for the booking */
    private String purpose;

    /** Expected number of attendees (optional, mostly applicable to rooms) */
    private Integer expectedAttendees;

    /** Current workflow status */
    private BookingStatus status = BookingStatus.PENDING;

    /** Admin remarks — reason for approval/rejection */
    private String adminRemarks;

    /** ID of the admin who reviewed the booking */
    private String reviewedBy;

    /** Timestamp when the booking was reviewed */
    private LocalDateTime reviewedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
