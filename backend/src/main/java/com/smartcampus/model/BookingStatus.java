package com.smartcampus.model;

/**
 * Workflow statuses for a booking request.
 *
 * <p>
 * Transitions:
 * </p>
 * <ul>
 * <li>PENDING → APPROVED (admin approves)</li>
 * <li>PENDING → REJECTED (admin rejects with reason)</li>
 * <li>APPROVED → CANCELLED (user cancels their own approved booking)</li>
 * </ul>
 */
public enum BookingStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}
