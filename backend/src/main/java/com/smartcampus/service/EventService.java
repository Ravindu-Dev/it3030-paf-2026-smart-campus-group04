package com.smartcampus.service;

import com.smartcampus.dto.EventDto;
import com.smartcampus.model.EventStatus;

import java.util.List;

/**
 * Service interface for Event management.
 */
public interface EventService {
    // Admin Functions
    EventDto createEvent(EventDto eventDto);
    EventDto updateEvent(String eventId, EventDto eventDto);
    void deleteEvent(String eventId);
    List<EventDto> getAllEventsForAdmin();
    void cancelEvent(String eventId);

    // User Functions
    List<EventDto> getAllEvents(boolean includePast);
    EventDto getEventById(String eventId);
    void registerForEvent(String eventId);
    void cancelRegistration(String eventId);
    List<EventDto> getUserRegisteredEvents();
    
    // Utility
    void updateParticipantCount(String eventId);
    void sendEventReminders();
}
