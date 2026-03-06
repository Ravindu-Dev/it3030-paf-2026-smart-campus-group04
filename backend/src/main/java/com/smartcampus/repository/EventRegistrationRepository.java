package com.smartcampus.repository;

import com.smartcampus.model.EventRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Event Registration collection.
 */
@Repository
public interface EventRegistrationRepository extends MongoRepository<EventRegistration, String> {
    List<EventRegistration> findByUserId(String userId);
    List<EventRegistration> findByEventId(String eventId);
    Optional<EventRegistration> findByEventIdAndUserId(String eventId, String userId);
    long countByEventId(String eventId);
}
