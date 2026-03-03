package com.smartcampus.dto;

import com.smartcampus.model.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Notifications.
 */
@Data
public class NotificationDto {
    private String id;
    private String userId;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime createdAt;
}
