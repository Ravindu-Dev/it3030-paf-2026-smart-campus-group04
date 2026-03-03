package com.smartcampus.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document for Notifications (Module D).
 */
@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;
    
    private String userId; // Recipient's MongoDB User ID
    private String message;
    private NotificationType type;
    private boolean isRead = false;
    
    @CreatedDate
    private LocalDateTime createdAt;
}
