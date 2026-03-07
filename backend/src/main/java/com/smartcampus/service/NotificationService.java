package com.smartcampus.service;

import com.smartcampus.dto.NotificationDto;
import com.smartcampus.model.NotificationType;

import java.util.List;

/**
 * Service interface for Notification management (Module D).
 */
public interface NotificationService {

    void createNotification(String userId, String message, NotificationType type);

    List<NotificationDto> getCurrentUserNotifications();

    NotificationDto markAsRead(String notificationId);

    void deleteNotification(String notificationId);

    void markAllAsRead();

    long getUnreadCount();

    List<NotificationDto> getAllNotifications();

    void toggleNotifications(com.smartcampus.model.User user, boolean enabled);

    boolean isNotificationsEnabled(com.smartcampus.model.User user);
}
