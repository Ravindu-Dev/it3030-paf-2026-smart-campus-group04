package com.smartcampus.repository;

import com.smartcampus.model.Event;
import com.smartcampus.model.EventStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Event collection.
 */
@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByEventDateAfter(LocalDate date);
}
