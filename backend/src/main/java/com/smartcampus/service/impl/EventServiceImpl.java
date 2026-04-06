package com.smartcampus.service.impl;

import com.smartcampus.dto.EventDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.EventRegistrationRepository;
import com.smartcampus.repository.EventRepository;
import com.smartcampus.service.EventService;
import com.smartcampus.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of EventService.
 */
@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    public EventServiceImpl(EventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.notificationService = notificationService;
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        return null; // Should not happen with secured endpoints
    }

    @Override
    public EventDto createEvent(EventDto eventDto) {
        validateEventDate(eventDto.getEventDate());
        User user = getCurrentUser();
        Event event = new Event();
        mapDtoToEntity(eventDto, event);
        event.setCreatedBy(user.getId());
        event.setParticipantCount(0);
        event.setCreatedAt(LocalDateTime.now());

        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    @Override
    public EventDto updateEvent(String eventId, EventDto eventDto) {
        validateEventDate(eventDto.getEventDate());
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        mapDtoToEntity(eventDto, event);
        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    @Override
    public void deleteEvent(String eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", "id", eventId);
        }

        // Notify participants before deletion? The requirement says "Admin cancels
        // event".
        // Usually delete = cancel in this context.
        cancelEvent(eventId);
        eventRepository.deleteById(eventId);
    }

    @Override
    public List<EventDto> getAllEventsForAdmin() {
        return eventRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void cancelEvent(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);

        // Notify all registered users
        List<EventRegistration> registrations = registrationRepository.findByEventId(eventId);
        for (EventRegistration reg : registrations) {
            notificationService.createNotification(
                    reg.getUserId(),
                    "The event: " + event.getTitle() + " has been cancelled by the administrator.",
                    NotificationType.EVENT_CANCELLED);
        }
    }

    @Override
    public List<EventDto> getAllEvents(boolean includePast) {
        User user = getCurrentUser();
        return eventRepository.findAll().stream()
                .filter(e -> {
                    EventStatus resolved = resolveStatus(e);
                    if (includePast) {
                        return resolved != EventStatus.CANCELLED;
                    }
                    return resolved == EventStatus.UPCOMING || resolved == EventStatus.ONGOING;
                })
                .map(e -> {
                    EventDto dto = mapToDto(e);
                    if (user != null) {
                        dto.setRegistered(
                                registrationRepository.findByEventIdAndUserId(e.getId(), user.getId()).isPresent());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public EventDto getEventById(String eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        User user = getCurrentUser();
        EventDto dto = mapToDto(event);
        if (user != null) {
            dto.setRegistered(registrationRepository.findByEventIdAndUserId(eventId, user.getId()).isPresent());
        }
        return dto;
    }

    @Override
    public void registerForEvent(String eventId) {
        User user = getCurrentUser();
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", "id", eventId));

        if (event.getStatus() != EventStatus.UPCOMING) {
            throw new IllegalStateException("Cannot register for an event that is not upcoming.");
        }

        if (event.getParticipantCount() >= event.getCapacity()) {
            throw new IllegalStateException("Event is already at full capacity.");
        }

        if (registrationRepository.findByEventIdAndUserId(eventId, user.getId()).isPresent()) {
            throw new IllegalStateException("You are already registered for this event.");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setUserId(user.getId());
        registration.setRegisteredAt(LocalDateTime.now());
        registrationRepository.save(registration);

        updateParticipantCount(eventId);

        notificationService.createNotification(
                user.getId(),
                "You successfully registered for the event: " + event.getTitle(),
                NotificationType.EVENT_REGISTERED);
    }

    @Override
    public void cancelRegistration(String eventId) {
        User user = getCurrentUser();
        EventRegistration registration = registrationRepository.findByEventIdAndUserId(eventId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("EventRegistration", "eventId/userId", eventId));

        registrationRepository.delete(registration);
        updateParticipantCount(eventId);
    }

    @Override
    public List<EventDto> getUserRegisteredEvents() {
        User user = getCurrentUser();
        List<EventRegistration> registrations = registrationRepository.findByUserId(user.getId());
        List<String> eventIds = registrations.stream()
                .map(EventRegistration::getEventId)
                .collect(Collectors.toList());

        return eventRepository.findAllById(eventIds).stream()
                .map(e -> {
                    EventDto dto = mapToDto(e);
                    dto.setRegistered(true);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public long getUpcomingRegisteredEventsCount() {
        User user = getCurrentUser();
        if (user == null) return 0;

        List<EventRegistration> registrations = registrationRepository.findByUserId(user.getId());
        if (registrations.isEmpty()) return 0;

        List<String> eventIds = registrations.stream()
                .map(EventRegistration::getEventId)
                .collect(Collectors.toList());

        return eventRepository.findAllById(eventIds).stream()
                .filter(e -> {
                    EventStatus status = resolveStatus(e);
                    return status == EventStatus.UPCOMING || status == EventStatus.ONGOING;
                })
                .count();
    }

    @Override
    public void updateParticipantCount(String eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            long count = registrationRepository.countByEventId(eventId);
            event.setParticipantCount((int) count);
            eventRepository.save(event);
        }
    }

    @Override
    public void sendEventReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Event> upcomingEvents = eventRepository.findByStatus(EventStatus.UPCOMING);

        for (Event event : upcomingEvents) {
            if (event.getEventDate().isEqual(tomorrow)) {
                List<EventRegistration> registrations = registrationRepository.findByEventId(event.getId());
                for (EventRegistration reg : registrations) {
                    notificationService.createNotification(
                            reg.getUserId(),
                            "Reminder: The event \"" + event.getTitle() + "\" is happening tomorrow at "
                                    + event.getStartTime() + ".",
                            NotificationType.EVENT_REMINDER);
                }
            }
        }
    }

    private EventDto mapToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setLocation(event.getLocation());
        dto.setEventDate(event.getEventDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setCapacity(event.getCapacity());
        dto.setParticipantCount(event.getParticipantCount());
        dto.setImageUrl(event.getImageUrl());
        dto.setStatus(resolveStatus(event));
        dto.setCreatedBy(event.getCreatedBy());
        dto.setCreatedAt(event.getCreatedAt());
        return dto;
    }

    private void mapDtoToEntity(EventDto dto, Event event) {
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setLocation(dto.getLocation());
        event.setEventDate(dto.getEventDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setCapacity(dto.getCapacity());
        event.setImageUrl(dto.getImageUrl());
        if (dto.getStatus() != null) {
            event.setStatus(dto.getStatus());
        }
    }

    private void validateEventDate(LocalDate date) {
        if (date != null && date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Event date cannot be in the past.");
        }
    }

    private EventStatus resolveStatus(Event event) {
        if (event.getStatus() == EventStatus.CANCELLED) {
            return EventStatus.CANCELLED;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDate eventDate = event.getEventDate();
        LocalTime startTime = event.getStartTime();
        LocalTime endTime = event.getEndTime();

        if (eventDate == null || startTime == null || endTime == null) {
            return event.getStatus();
        }

        LocalDateTime start = LocalDateTime.of(eventDate, startTime);
        LocalDateTime end = LocalDateTime.of(eventDate, endTime);

        if (now.isAfter(end)) {
            return EventStatus.COMPLETED;
        } else if (now.isAfter(start) && now.isBefore(end)) {
            return EventStatus.ONGOING;
        } else if (now.isBefore(start)) {
            return EventStatus.UPCOMING;
        }

        return event.getStatus();
    }
}
