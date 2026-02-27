package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.BookingDto;
import com.smartcampus.dto.CreateBookingRequest;
import com.smartcampus.dto.UpdateBookingStatusRequest;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Booking Management (Module B).
 *
 * <p>
 * Endpoints:
 * </p>
 * <ul>
 * <li>POST /api/bookings — Create a booking (authenticated user)</li>
 * <li>GET /api/bookings/my — Get current user's bookings</li>
 * <li>GET /api/bookings — Get all bookings (ADMIN only)</li>
 * <li>GET /api/bookings/{id} — Get a single booking</li>
 * <li>PATCH /api/bookings/{id}/approve — Approve a booking (ADMIN only)</li>
 * <li>PATCH /api/bookings/{id}/reject — Reject a booking (ADMIN only)</li>
 * <li>PATCH /api/bookings/{id}/cancel — Cancel own booking (authenticated
 * user)</li>
 * <li>DELETE /api/bookings/{id} — Delete a booking (ADMIN only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/bookings")
public class BookingController {

        private final BookingService bookingService;

        public BookingController(BookingService bookingService) {
                this.bookingService = bookingService;
        }

        /**
         * Extract the user ID from the Authentication principal.
         * The JwtAuthenticationFilter sets the principal to the full User object.
         */
        private String getUserId(Authentication authentication) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof User) {
                        return ((User) principal).getId();
                }
                return authentication.getName();
        }

        /**
         * POST /api/bookings — Create a new booking request.
         * Any authenticated user can create a booking.
         */
        @PostMapping
        public ResponseEntity<ApiResponse<BookingDto>> createBooking(
                        @Valid @RequestBody CreateBookingRequest request,
                        Authentication authentication) {

                String userId = getUserId(authentication);
                BookingDto created = bookingService.createBooking(request, userId);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Booking request created successfully", created));
        }

        /**
         * GET /api/bookings/my — Get the current user's bookings.
         * Supports optional status filter: ?status=PENDING
         */
        @GetMapping("/my")
        public ResponseEntity<ApiResponse<List<BookingDto>>> getMyBookings(
                        @RequestParam(name = "status", required = false) BookingStatus status,
                        Authentication authentication) {

                String userId = getUserId(authentication);
                List<BookingDto> bookings = bookingService.getUserBookings(userId, status);

                return ResponseEntity.ok(
                                ApiResponse.success("User bookings retrieved successfully", bookings));
        }

        /**
         * GET /api/bookings — Get all bookings (admin only).
         * Supports optional filters: ?status=PENDING&facilityId=abc123
         */
        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<List<BookingDto>>> getAllBookings(
                        @RequestParam(name = "status", required = false) BookingStatus status,
                        @RequestParam(name = "facilityId", required = false) String facilityId) {

                List<BookingDto> bookings = bookingService.getAllBookings(status, facilityId);

                return ResponseEntity.ok(
                                ApiResponse.success("All bookings retrieved successfully", bookings));
        }

        /**
         * GET /api/bookings/{id} — Get a single booking by ID.
         */
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<BookingDto>> getBookingById(@PathVariable(name = "id") String id) {

                BookingDto booking = bookingService.getBookingById(id);

                return ResponseEntity.ok(
                                ApiResponse.success("Booking retrieved successfully", booking));
        }

        /**
         * PATCH /api/bookings/{id}/approve — Approve a pending booking.
         * Restricted to ADMIN role.
         */
        @PatchMapping("/{id}/approve")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<BookingDto>> approveBooking(
                        @PathVariable(name = "id") String id,
                        @RequestBody(required = false) UpdateBookingStatusRequest request,
                        Authentication authentication) {

                String adminId = getUserId(authentication);
                BookingDto approved = bookingService.approveBooking(id, request, adminId);

                return ResponseEntity.ok(
                                ApiResponse.success("Booking approved successfully", approved));
        }

        /**
         * PATCH /api/bookings/{id}/reject — Reject a pending booking.
         * Restricted to ADMIN role. Requires a rejection reason.
         */
        @PatchMapping("/{id}/reject")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<BookingDto>> rejectBooking(
                        @PathVariable(name = "id") String id,
                        @RequestBody UpdateBookingStatusRequest request,
                        Authentication authentication) {

                String adminId = getUserId(authentication);
                BookingDto rejected = bookingService.rejectBooking(id, request, adminId);

                return ResponseEntity.ok(
                                ApiResponse.success("Booking rejected successfully", rejected));
        }

        /**
         * PATCH /api/bookings/{id}/cancel — Cancel an own booking.
         * Any authenticated user can cancel their own PENDING or APPROVED booking.
         */
        @PatchMapping("/{id}/cancel")
        public ResponseEntity<ApiResponse<BookingDto>> cancelBooking(
                        @PathVariable(name = "id") String id,
                        Authentication authentication) {

                String userId = getUserId(authentication);
                BookingDto cancelled = bookingService.cancelBooking(id, userId);

                return ResponseEntity.ok(
                                ApiResponse.success("Booking cancelled successfully", cancelled));
        }

        /**
         * DELETE /api/bookings/{id} — Delete a booking.
         * Restricted to ADMIN role.
         */
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable(name = "id") String id) {

                bookingService.deleteBooking(id);

                return ResponseEntity.ok(
                                ApiResponse.success("Booking deleted successfully"));
        }
}
