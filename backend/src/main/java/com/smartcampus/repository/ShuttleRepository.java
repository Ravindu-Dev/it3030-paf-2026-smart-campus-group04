package com.smartcampus.repository;

import com.smartcampus.model.Shuttle;
import com.smartcampus.model.ShuttleStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ShuttleRepository extends MongoRepository<Shuttle, String> {
    List<Shuttle> findByRouteId(String routeId);

    List<Shuttle> findByStatus(ShuttleStatus status);

    Optional<Shuttle> findByTrackingToken(String trackingToken);
}
