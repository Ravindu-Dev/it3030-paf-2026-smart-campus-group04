package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MongoDB document representing a lost or found item report.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "lost_found_items")
public class LostFoundItem {

    @Id
    private String id;

    /** LOST or FOUND */
    private LostFoundItemType type;

    /** Short title, e.g. "Black iPhone 15 Pro" */
    private String title;

    /** Detailed description */
    private String description;

    /** Category of the item */
    private LostFoundItemCategory category;

    /** Where the item was lost or found */
    private String location;

    /** Date the item was lost or found */
    private LocalDate dateOccurred;

    /** Optional image URL */
    private String imageUrl;

    /** Contact email for the reporter */
    private String contactEmail;

    /** Contact phone for the reporter */
    private String contactPhone;

    /** Current workflow status */
    private LostFoundItemStatus status = LostFoundItemStatus.OPEN;

    // ─── Reporter info (denormalized) ────────────────────────────────

    private String reportedByUserId;
    private String reportedByUserName;
    private String reportedByUserEmail;

    // ─── Claim info ──────────────────────────────────────────────────

    private String claimedByUserId;
    private String claimedByUserName;
    private LocalDateTime claimedAt;

    /** Admin notes when closing */
    private String adminNotes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
