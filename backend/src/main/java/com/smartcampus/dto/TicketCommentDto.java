package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for ticket comment data returned to clients.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentDto {
    private String id;
    private String ticketId;
    private String userId;
    private String userName;
    private String userProfilePicture;
    private String userRole;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
