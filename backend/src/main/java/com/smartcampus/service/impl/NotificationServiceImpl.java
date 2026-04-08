package com.smartcampus.service.impl;

import com.smartcampus.dto.NotificationDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the NotificationService using MongoDB.
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationServiceImpl(NotificationRepository notificationRepository, 
                                 UserRepository userRepository,
                                 SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    private String getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @Override
    public void createNotification(String userId, String message, NotificationType type) {
        // Call smart notification with defaults
        sendSmartNotification(userId, message, NotificationPriority.MEDIUM, NotificationCategory.SYSTEM, type);
    }

    @Override
    public void sendSmartNotification(String userId, String message, NotificationPriority priority, NotificationCategory category, NotificationType type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && !user.isNotificationsEnabled()) {
            logger.info("Skipping notification for user {} as notifications are disabled", userId);
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type);
        notification.setPriority(priority != null ? priority : NotificationPriority.MEDIUM);
        notification.setCategory(category != null ? category : NotificationCategory.SYSTEM);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        logger.info("Created {} notification (Priority: {}, Category: {}) for user {}", type, priority, category, userId);

        // Real-time Push via WebSocket
        try {
            NotificationDto dto = mapToDto(saved);
            messagingTemplate.convertAndSend("/topic/notifications/" + userId, dto);
            logger.info("Sent WebSocket notification to /topic/notifications/{}", userId);
        } catch (Exception e) {
            logger.error("Failed to send WebSocket notification: {}", e.getMessage());
        }
    }

    @Override
    public List<NotificationDto> getCurrentUserNotifications() {
        String userId = getAuthenticatedUserId();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(String notificationId) {
        String userId = getAuthenticatedUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You do not have permission to access this notification");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteNotification(String notificationId) {
        String userId = getAuthenticatedUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You do not have permission to delete this notification");
        }

        notificationRepository.delete(notification);
        logger.info("Deleted notification {} for user {}", notificationId, userId);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        String userId = getAuthenticatedUserId();
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        
        if (!unreadNotifications.isEmpty()) {
            unreadNotifications.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(unreadNotifications);
            logger.info("Marked all notifications as read for user {}", userId);
        }
    }

    @Override
    public long getUnreadCount() {
        String userId = getAuthenticatedUserId();
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public List<NotificationDto> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleNotifications(User user, boolean enabled) {
        user.setNotificationsEnabled(enabled);
        userRepository.save(user);
        logger.info("Notifications {} for user {}", enabled ? "enabled" : "disabled", user.getId());
    }

    @Override
    public boolean isNotificationsEnabled(User user) {
        return user.isNotificationsEnabled();
    }

    private NotificationDto mapToDto(Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setPriority(notification.getPriority());
        dto.setCategory(notification.getCategory());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
