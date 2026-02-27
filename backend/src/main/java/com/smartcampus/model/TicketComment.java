package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing a comment on a maintenance ticket.
 * Both users and staff can add comments. Ownership rules apply
 * for edit/delete operations.
 *
 * <p>
 * Stored in the "ticket_comments" collection.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "ticket_comments")
public class TicketComment {

    @Id
    private String id;

    /** ID of the ticket this comment belongs to */
    private String ticketId;

    /** ID of the user who posted the comment */
    private String userId;

    /** Denormalized user name for display */
    private String userName;

    /** User's profile picture URL */
    private String userProfilePicture;

    /** Role of the user at the time of commenting */
    private String userRole;

    /** Comment content */
    private String content;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
