package com.smartcampus.repository;

import com.smartcampus.model.DriverRating;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverRatingRepository extends MongoRepository<DriverRating, String> {
    List<DriverRating> findByShuttleIdOrderByCreatedAtDesc(String shuttleId);
}
