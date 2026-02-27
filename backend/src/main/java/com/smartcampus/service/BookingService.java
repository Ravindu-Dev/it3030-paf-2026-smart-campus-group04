package com.smartcampus.service;

import com.smartcampus.dto.BookingDto;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.dto.UpdateBookingStatusRequest;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.FacilityRepository;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Booking management (Module B).
 *
 * <p>
 * Handles booking creation with conflict detection, workflow transitions
 * (approve/reject/cancel), and filtered queries for both users and admins.
 * </p>
 */
@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
            FacilityRepository facilityRepository,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
    }

    // ─── CREATE ──────────────────────────────────────────────────────────

    /**
     * Create a new booking request.
     *
     * <p>
     * Validates:
     * </p>
     * <ul>
     * <li>Facility exists and is ACTIVE</li>
     * <li>Start time is before end time</li>
     * <li>No scheduling conflicts with existing PENDING/APPROVED bookings</li>
     * </ul>
     *
     * @param request the booking request
     * @param userId  the ID of the authenticated user
     * @return the created booking DTO
     */
    public BookingDto createBooking(CreateBookingRequest request, String userId) {
        // 1. Validate facility exists and is active
        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", request.getFacilityId()));

        if (facility.getStatus() != FacilityStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot book a facility that is currently OUT_OF_SERVICE");
        }

        // 2. Validate time range
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // 3. Check for scheduling conflicts
        checkForConflicts(request.getFacilityId(), request.getBookingDate(),
                request.getStartTime(), request.getEndTime(), null);

        // 4. Fetch user information for denormalization
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 5. Build and save the booking
        Booking booking = new Booking();
        booking.setFacilityId(request.getFacilityId());
        booking.setFacilityName(facility.getName());
        booking.setUserId(userId);
        booking.setUserName(user.getName());
        booking.setUserEmail(user.getEmail());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        logger.info("Booking created: {} for facility {} on {} by user {}",
                saved.getId(), facility.getName(), request.getBookingDate(), userId);

        return mapToDto(saved);
    }

    // ─── READ ────────────────────────────────────────────────────────────

    /**
     * Get a booking by its ID.
     */
    public BookingDto getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));
        return mapToDto(booking);
    }

    /**
     * Get all bookings for the authenticated user, with optional status filter.
     */
    public List<BookingDto> getUserBookings(String userId, BookingStatus status) {
        List<Booking> bookings;
        if (status != null) {
            bookings = bookingRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        } else {
            bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return bookings.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    /**
     * Get all bookings (admin). Supports optional filters by status and facilityId.
     */
    public List<BookingDto> getAllBookings(BookingStatus status, String facilityId) {
        List<Booking> bookings;

        if (status != null) {
            bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (facilityId != null && !facilityId.isBlank()) {
            bookings = bookingRepository.findByFacilityIdOrderByCreatedAtDesc(facilityId);
        } else {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        }

        // Apply additional in-memory filters for combined criteria
        if (status != null && facilityId != null && !facilityId.isBlank()) {
            String filterFacilityId = facilityId;
            bookings = bookings.stream()
                    .filter(b -> b.getFacilityId().equals(filterFacilityId))
                    .collect(Collectors.toList());
        }

        return bookings.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // ─── WORKFLOW ────────────────────────────────────────────────────────

    /**
     * Approve a pending booking (admin only).
     * Re-checks for conflicts before approving.
     */
    public BookingDto approveBooking(String bookingId, UpdateBookingStatusRequest request, String adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        // Re-check for conflicts before approving (another booking might have been
        // approved since)
        checkForConflicts(booking.getFacilityId(), booking.getBookingDate(),
                booking.getStartTime(), booking.getEndTime(), bookingId);

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminRemarks(request != null ? request.getRemarks() : null);
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);
        logger.info("Booking approved: {} by admin {}", bookingId, adminId);

        return mapToDto(updated);
    }

    /**
     * Reject a pending booking (admin only).
     * Requires a rejection reason in the remarks.
     */
    public BookingDto rejectBooking(String bookingId, UpdateBookingStatusRequest request, String adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }

        if (request == null || request.getRemarks() == null || request.getRemarks().isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminRemarks(request.getRemarks());
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());

        Booking updated = bookingRepository.save(booking);
        logger.info("Booking rejected: {} by admin {} — reason: {}", bookingId, adminId, request.getRemarks());

        return mapToDto(updated);
    }

    /**
     * Cancel an approved booking (owner only).
     */
    public BookingDto cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Only PENDING or APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Booking updated = bookingRepository.save(booking);
        logger.info("Booking cancelled: {} by user {}", bookingId, userId);

        return mapToDto(updated);
    }

    // ─── DELETE ──────────────────────────────────────────────────────────

    /**
     * Delete a booking (admin only).
     */
    public void deleteBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        bookingRepository.delete(booking);
        logger.info("Booking deleted: {}", bookingId);
    }

    // ─── CONFLICT DETECTION ─────────────────────────────────────────────

    /**
     * Check for scheduling conflicts with existing PENDING/APPROVED bookings
     * on the same facility and date.
     *
     * @param facilityId       the facility being booked
     * @param bookingDate      the date of the booking
     * @param startTime        desired start time
     * @param endTime          desired end time
     * @param excludeBookingId booking ID to exclude from conflict check (for
     *                         re-validation during approval)
     * @throws BookingConflictException if a conflict is detected
     */
    private void checkForConflicts(String facilityId, java.time.LocalDate bookingDate,
            LocalTime startTime, LocalTime endTime,
            String excludeBookingId) {
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.APPROVED);
        List<Booking> existingBookings = bookingRepository
                .findByFacilityIdAndBookingDateAndStatusIn(facilityId, bookingDate, activeStatuses);

        for (Booking existing : existingBookings) {
            // Skip the booking being re-validated (for approval re-check)
            if (excludeBookingId != null && existing.getId().equals(excludeBookingId)) {
                continue;
            }

            // Check for time overlap: two intervals [s1, e1) and [s2, e2) overlap if s1 <
            // e2 AND s2 < e1
            if (startTime.isBefore(existing.getEndTime()) && existing.getStartTime().isBefore(endTime)) {
                throw new BookingConflictException(
                        String.format(
                                "Scheduling conflict: facility is already booked from %s to %s on %s (Booking ID: %s, Status: %s)",
                                existing.getStartTime(), existing.getEndTime(), bookingDate,
                                existing.getId(), existing.getStatus()));
            }
        }
    }

    // ─── MAPPING ─────────────────────────────────────────────────────────

    /**
     * Map a Booking document to a BookingDto.
     */
    private BookingDto mapToDto(Booking booking) {
        BookingDto dto = new BookingDto();
        dto.setId(booking.getId());
        dto.setFacilityId(booking.getFacilityId());
        dto.setFacilityName(booking.getFacilityName());
        dto.setUserId(booking.getUserId());
        dto.setUserName(booking.getUserName());
        dto.setUserEmail(booking.getUserEmail());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setPurpose(booking.getPurpose());
        dto.setExpectedAttendees(booking.getExpectedAttendees());
        dto.setStatus(booking.getStatus());
        dto.setAdminRemarks(booking.getAdminRemarks());
        dto.setReviewedBy(booking.getReviewedBy());
        dto.setReviewedAt(booking.getReviewedAt());

        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
