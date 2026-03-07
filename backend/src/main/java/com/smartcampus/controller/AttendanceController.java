package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.model.User;
import com.smartcampus.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for attendance tracking operations.
 *
 * <p>
 * Endpoints:
 * </p>
 * <ul>
 * <li>POST /api/attendance/mark — Mark attendance via QR scan (ADMIN/MANAGER
 * only)</li>
 * <li>GET /api/attendance/my — Get current user's attendance history</li>
 * <li>GET /api/attendance — Get all attendance records (ADMIN/MANAGER
 * only)</li>
 * <li>GET /api/attendance/stats/me — Get current user's attendance stats</li>
 * <li>GET /api/attendance/stats — Get overall stats (ADMIN/MANAGER only)</li>
 * <li>GET /api/attendance/user/{userId} — Get specific user's attendance
 * (ADMIN/MANAGER only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * POST /api/attendance/mark — Mark attendance via QR code scan.
     * Only ADMIN and MANAGER can scan and mark attendance.
     */
    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AttendanceDto>> markAttendance(
            @AuthenticationPrincipal User markedByUser,
            @Valid @RequestBody MarkAttendanceRequest request) {

        AttendanceDto attendance = attendanceService.markAttendance(request, markedByUser);

        return ResponseEntity.ok(
                ApiResponse.success("Attendance marked successfully", attendance));
    }

    /**
     * GET /api/attendance/my — Get the current user's attendance history.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getMyAttendance(
            @AuthenticationPrincipal User user) {

        List<AttendanceDto> records = attendanceService.getMyAttendance(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Attendance history retrieved", records));
    }

    /**
     * GET /api/attendance — Get all attendance records (ADMIN/MANAGER only).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAllAttendance() {

        List<AttendanceDto> records = attendanceService.getAllAttendance();

        return ResponseEntity.ok(
                ApiResponse.success("All attendance records retrieved", records));
    }

    /**
     * GET /api/attendance/stats/me — Get the current user's attendance stats.
     */
    @GetMapping("/stats/me")
    public ResponseEntity<ApiResponse<AttendanceStatsDto>> getMyStats(
            @AuthenticationPrincipal User user) {

        AttendanceStatsDto stats = attendanceService.getUserStats(user.getId());

        return ResponseEntity.ok(
                ApiResponse.success("Attendance stats retrieved", stats));
    }

    /**
     * GET /api/attendance/stats — Get overall attendance stats (ADMIN/MANAGER
     * only).
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AttendanceStatsDto>> getOverallStats() {

        AttendanceStatsDto stats = attendanceService.getOverallStats();

        return ResponseEntity.ok(
                ApiResponse.success("Overall attendance stats retrieved", stats));
    }

    /**
     * GET /api/attendance/user/{userId} — Get a specific user's attendance
     * (ADMIN/MANAGER only).
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getUserAttendance(
            @PathVariable String userId) {

        List<AttendanceDto> records = attendanceService.getUserAttendance(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User attendance retrieved", records));
    }
}
