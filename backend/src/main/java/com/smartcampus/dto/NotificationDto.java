package com.smartcampus.dto;

import com.smartcampus.model.NotificationCategory;
import com.smartcampus.model.NotificationPriority;
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
    private NotificationPriority priority;
    private NotificationCategory category;
    private boolean isRead;
    private LocalDateTime createdAt;
}
