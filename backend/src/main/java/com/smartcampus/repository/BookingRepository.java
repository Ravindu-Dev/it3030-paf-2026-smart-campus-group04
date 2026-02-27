package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * MongoDB repository for Booking documents.
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    /** Find all bookings by a specific user, ordered by creation date descending */
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Find user bookings filtered by status */
    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, BookingStatus status);

    /**
     * Find all bookings for a specific facility on a given date with specific
     * statuses (for conflict checking)
     */
    List<Booking> findByFacilityIdAndBookingDateAndStatusIn(
            String facilityId, LocalDate bookingDate, List<BookingStatus> statuses);

    /** Find all bookings filtered by status */
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    /** Find all bookings filtered by facility */
    List<Booking> findByFacilityIdOrderByCreatedAtDesc(String facilityId);

    /** Find all bookings ordered by creation date descending */
    List<Booking> findAllByOrderByCreatedAtDesc();

    /**
     * Find all bookings for a specific facility on a given date (for availability
     * display)
     */
    List<Booking> findByFacilityIdAndBookingDate(String facilityId, LocalDate bookingDate);
}
