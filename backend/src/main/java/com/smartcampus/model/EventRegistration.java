package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * MongoDB document representing an Event Registration.
 * A user can register for an event only once.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "event_registrations")
@CompoundIndex(name = "event_user_idx", def = "{'eventId': 1, 'userId': 1}", unique = true)
public class EventRegistration {

    @Id
    private String id;
    
    private String eventId;
    private String userId;
    
    @CreatedDate
    private LocalDateTime registeredAt;
}
