package com.smartcampus.service;

import com.smartcampus.dto.CreateLostFoundItemRequest;
import com.smartcampus.dto.LostFoundItemDto;
import com.smartcampus.dto.UpdateLostFoundItemRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.LostFoundRepository;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LostFoundService {

    private static final Logger logger = LoggerFactory.getLogger(LostFoundService.class);

    private final LostFoundRepository lostFoundRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public LostFoundService(LostFoundRepository lostFoundRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.lostFoundRepository = lostFoundRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ─── REPORT ──────────────────────────────────────────────────────────

    public LostFoundItemDto reportItem(CreateLostFoundItemRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        LostFoundItem item = new LostFoundItem();
        item.setType(request.getType());
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setLocation(request.getLocation());
        item.setDateOccurred(request.getDateOccurred());
        item.setImageUrl(request.getImageUrl());
        item.setContactEmail(request.getContactEmail() != null ? request.getContactEmail() : user.getEmail());
        item.setContactPhone(request.getContactPhone());
        item.setStatus(LostFoundItemStatus.OPEN);
        item.setReportedByUserId(userId);
        item.setReportedByUserName(user.getName());
        item.setReportedByUserEmail(user.getEmail());

        LostFoundItem saved = lostFoundRepository.save(item);
        logger.info("Lost/Found item reported: {} by user {}", saved.getId(), userId);

        return mapToDto(saved);
    }

    // ─── READ ────────────────────────────────────────────────────────────

    public List<LostFoundItemDto> getAllItems(LostFoundItemType type, LostFoundItemStatus status,
            LostFoundItemCategory category, String search) {
        List<LostFoundItem> items;

        if (search != null && !search.isBlank()) {
            items = lostFoundRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(search.trim());
        } else if (type != null && status != null) {
            items = lostFoundRepository.findByTypeAndStatusOrderByCreatedAtDesc(type, status);
        } else if (type != null) {
            items = lostFoundRepository.findByTypeOrderByCreatedAtDesc(type);
        } else if (status != null) {
            items = lostFoundRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            items = lostFoundRepository.findAllByOrderByCreatedAtDesc();
        }

        // Apply additional in-memory filters for combined criteria
        if (category != null) {
            items = items.stream()
                    .filter(i -> i.getCategory() == category)
                    .collect(Collectors.toList());
        }
        if (type != null && search != null && !search.isBlank()) {
            LostFoundItemType filterType = type;
            items = items.stream()
                    .filter(i -> i.getType() == filterType)
                    .collect(Collectors.toList());
        }
        if (status != null && search != null && !search.isBlank()) {
            LostFoundItemStatus filterStatus = status;
            items = items.stream()
                    .filter(i -> i.getStatus() == filterStatus)
                    .collect(Collectors.toList());
        }

        return items.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public LostFoundItemDto getItemById(String itemId) {
        LostFoundItem item = lostFoundRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("LostFoundItem", "id", itemId));
        return mapToDto(item);
    }

    public List<LostFoundItemDto> getMyItems(String userId) {
        return lostFoundRepository.findByReportedByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ─── CLAIM ───────────────────────────────────────────────────────────

    public LostFoundItemDto claimItem(String itemId, String userId) {
        LostFoundItem item = lostFoundRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("LostFoundItem", "id", itemId));

        if (item.getStatus() != LostFoundItemStatus.OPEN) {
            throw new IllegalArgumentException("This item has already been claimed or closed.");
        }

        User claimant = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        item.setStatus(LostFoundItemStatus.CLAIMED);
        item.setClaimedByUserId(userId);
        item.setClaimedByUserName(claimant.getName());
        item.setClaimedAt(LocalDateTime.now());

        LostFoundItem saved = lostFoundRepository.save(item);
        logger.info("Item {} claimed by user {}", itemId, userId);

        // Notify the reporter
        notificationService.createNotification(
                item.getReportedByUserId(),
                "Your " + item.getType().name().toLowerCase() + " item \"" + item.getTitle()
                        + "\" has been claimed by " + claimant.getName() + ".",
                NotificationType.LOST_ITEM_CLAIMED);

        return mapToDto(saved);
    }

    // ─── ADMIN ACTIONS ───────────────────────────────────────────────────

    public LostFoundItemDto closeItem(String itemId, UpdateLostFoundItemRequest request) {
        LostFoundItem item = lostFoundRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("LostFoundItem", "id", itemId));

        item.setStatus(LostFoundItemStatus.CLOSED);
        if (request != null && request.getAdminNotes() != null) {
            item.setAdminNotes(request.getAdminNotes());
        }

        LostFoundItem saved = lostFoundRepository.save(item);
        logger.info("Item {} closed by admin", itemId);

        return mapToDto(saved);
    }

    public void deleteItem(String itemId) {
        if (!lostFoundRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("LostFoundItem", "id", itemId);
        }
        lostFoundRepository.deleteById(itemId);
        logger.info("Item {} deleted", itemId);
    }

    // ─── MAPPING ─────────────────────────────────────────────────────────

    private LostFoundItemDto mapToDto(LostFoundItem item) {
        LostFoundItemDto dto = new LostFoundItemDto();
        dto.setId(item.getId());
        dto.setType(item.getType());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setLocation(item.getLocation());
        dto.setDateOccurred(item.getDateOccurred());
        dto.setImageUrl(item.getImageUrl());
        dto.setContactEmail(item.getContactEmail());
        dto.setContactPhone(item.getContactPhone());
        dto.setStatus(item.getStatus());
        dto.setReportedByUserId(item.getReportedByUserId());
        dto.setReportedByUserName(item.getReportedByUserName());
        dto.setReportedByUserEmail(item.getReportedByUserEmail());
        dto.setClaimedByUserId(item.getClaimedByUserId());
        dto.setClaimedByUserName(item.getClaimedByUserName());
        dto.setClaimedAt(item.getClaimedAt());
        dto.setAdminNotes(item.getAdminNotes());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }
}
