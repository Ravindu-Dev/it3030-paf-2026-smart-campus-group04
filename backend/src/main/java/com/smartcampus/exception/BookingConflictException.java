package com.smartcampus.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a booking request conflicts with an existing booking
 * (overlapping time range on the same resource and date).
 *
 * <p>
 * Maps to HTTP 409 Conflict.
 * </p>
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class BookingConflictException extends RuntimeException {

    public BookingConflictException(String message) {
        super(message);
    }
}
