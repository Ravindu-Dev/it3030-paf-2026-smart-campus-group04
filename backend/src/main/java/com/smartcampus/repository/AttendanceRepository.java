package com.smartcampus.repository;

import com.smartcampus.model.Attendance;
import com.smartcampus.model.AttendanceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MongoDB repository for attendance records.
 */
@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {

    /** Get a user's attendance history, most recent first */
    List<Attendance> findByUserIdOrderByMarkedAtDesc(String userId);

    /** Get all attendance records, most recent first */
    List<Attendance> findAllByOrderByMarkedAtDesc();

    /** Get attendance records within a date range */
    List<Attendance> findByMarkedAtBetween(LocalDateTime start, LocalDateTime end);

    /** Count records by user and status */
    long countByUserIdAndStatus(String userId, AttendanceStatus status);

    /** Count records by user */
    long countByUserId(String userId);

    /** Find recent attendance for a user (to prevent duplicate scans) */
    List<Attendance> findByUserIdAndMarkedAtAfter(String userId, LocalDateTime after);
}
