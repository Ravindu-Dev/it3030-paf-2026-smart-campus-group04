package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB document representing a maintenance or incident ticket
 * raised against a campus resource/booking.
 *
 * <p>
 * Stored in the "tickets" collection.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    /** ID of the booking this ticket is raised against */
    private String bookingId;

    /** ID of the facility/resource involved */
    private String facilityId;

    /** Denormalized facility name for display */
    private String facilityName;

    /** Physical location of the resource */
    private String location;

    /** ID of the user who created the ticket */
    private String userId;

    /** Denormalized user name for display */
    private String userName;

    /** Denormalized user email for display */
    private String userEmail;

    /** Issue category */
    private TicketCategory category;

    /** Issue priority */
    private TicketPriority priority;

    /** Detailed description of the issue */
    private String description;

    /** Preferred contact email */
    private String contactEmail;

    /** Preferred contact phone number */
    private String contactPhone;

    /** Evidence image URLs (max 3) */
    private List<String> imageUrls = new ArrayList<>();

    /** Current workflow status */
    private TicketStatus status = TicketStatus.OPEN;

    /** ID of the assigned technician */
    private String assignedTechnicianId;

    /** Denormalized technician name */
    private String assignedTechnicianName;

    /** ID of admin/manager who assigned the technician */
    private String assignedBy;

    /** Reason for rejection (when status is REJECTED) */
    private String rejectionReason;

    /** Resolution notes added by the technician */
    private String resolutionNotes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
