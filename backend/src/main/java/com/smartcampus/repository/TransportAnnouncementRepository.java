package com.smartcampus.repository;

import com.smartcampus.model.TransportAnnouncement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportAnnouncementRepository extends MongoRepository<TransportAnnouncement, String> {
    List<TransportAnnouncement> findByIsActiveTrueOrderByCreatedAtDesc();
}
