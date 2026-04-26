package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transport_announcements")
public class TransportAnnouncement {

    @Id
    private String id;
    
    private String message;
    
    private boolean isActive;

    @CreatedDate
    private LocalDateTime createdAt;
}
