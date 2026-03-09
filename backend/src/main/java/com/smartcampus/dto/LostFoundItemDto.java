package com.smartcampus.dto;

import com.smartcampus.model.LostFoundItemCategory;
import com.smartcampus.model.LostFoundItemStatus;
import com.smartcampus.model.LostFoundItemType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LostFoundItemDto {
    private String id;
    private LostFoundItemType type;
    private String title;
    private String description;
    private LostFoundItemCategory category;
    private String location;
    private LocalDate dateOccurred;
    private String imageUrl;
    private String contactEmail;
    private String contactPhone;
    private LostFoundItemStatus status;

    private String reportedByUserId;
    private String reportedByUserName;
    private String reportedByUserEmail;

    private String claimedByUserId;
    private String claimedByUserName;
    private LocalDateTime claimedAt;

    private String adminNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
