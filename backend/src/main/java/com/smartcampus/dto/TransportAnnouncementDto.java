package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransportAnnouncementDto {
    private String id;
    private String message;
    private boolean isActive;
    private LocalDateTime createdAt;
}
