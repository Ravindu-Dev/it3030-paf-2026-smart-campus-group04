package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for attendance statistics summary.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStatsDto {

    private long totalRecords;
    private long presentCount;
    private long lateCount;
    private long absentCount;
    private double attendanceRate;
}
