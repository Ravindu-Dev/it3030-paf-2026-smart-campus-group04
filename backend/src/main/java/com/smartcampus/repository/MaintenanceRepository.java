package com.smartcampus.repository;

import com.smartcampus.model.Maintenance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaintenanceRepository extends MongoRepository<Maintenance, String> {
    // We only ever need one maintenance config, so we can find the first one or use a fixed ID
    Optional<Maintenance> findFirstByOrderByStartTimeDesc();
}
