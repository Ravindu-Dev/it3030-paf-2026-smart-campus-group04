package com.smartcampus.dto;

import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for Ticket data returned to clients.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDto {
    private String id;
    private String bookingId;
    private String facilityId;
    private String facilityName;
    private String location;
    private String userId;
    private String userName;
    private String userEmail;
    private TicketCategory category;
    private TicketPriority priority;
    private String description;
    private String contactEmail;
    private String contactPhone;
    private List<String> imageUrls;
    private TicketStatus status;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String assignedBy;
    private String rejectionReason;
    private String resolutionNotes;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
