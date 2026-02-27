package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a time window during which a facility is available for booking.
 * Embedded inside the {@link Facility} document (not a separate collection).
 *
 * <p>
 * Example: Monday 08:00–17:00
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWindow {

    /** Day of the week, e.g. "MONDAY", "TUESDAY" */
    private String dayOfWeek;

    /** Start time in HH:mm format, e.g. "08:00" */
    private String startTime;

    /** End time in HH:mm format, e.g. "17:00" */
    private String endTime;
}
