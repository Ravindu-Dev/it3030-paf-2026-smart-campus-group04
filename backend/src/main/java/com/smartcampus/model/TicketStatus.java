package com.smartcampus.model;

/**
 * Workflow statuses for maintenance/incident tickets.
 *
 * <p>
 * Transitions:
 * </p>
 * <ul>
 * <li>OPEN → IN_PROGRESS (when technician is assigned)</li>
 * <li>IN_PROGRESS → RESOLVED (technician marks as fixed)</li>
 * <li>RESOLVED → CLOSED (admin/user confirms resolution)</li>
 * <li>OPEN → REJECTED (admin rejects with reason)</li>
 * </ul>
 */
public enum TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED,
    REJECTED
}
