package com.smartcampus.repository;

import com.smartcampus.model.Facility;
import com.smartcampus.model.FacilityStatus;
import com.smartcampus.model.FacilityType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB repository for {@link Facility} documents.
 * Provides standard CRUD + custom query methods for search and filtering.
 */
@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {

    /** Find all facilities of a specific type. */
    List<Facility> findByType(FacilityType type);

    /** Find all facilities with a specific status. */
    List<Facility> findByStatus(FacilityStatus status);

    /** Find facilities by type and status together. */
    List<Facility> findByTypeAndStatus(FacilityType type, FacilityStatus status);

    /** Search by name (case-insensitive, partial match). */
    List<Facility> findByNameContainingIgnoreCase(String name);

    /** Find facilities at a specific location (case-insensitive, partial match). */
    List<Facility> findByLocationContainingIgnoreCase(String location);

    /** Find facilities with capacity greater than or equal to a minimum. */
    List<Facility> findByCapacityGreaterThanEqual(Integer minCapacity);
}
