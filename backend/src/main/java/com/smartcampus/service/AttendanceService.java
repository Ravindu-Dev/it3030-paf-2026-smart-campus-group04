package com.smartcampus.service;

import com.smartcampus.dto.AttendanceDto;
import com.smartcampus.dto.AttendanceStatsDto;
import com.smartcampus.dto.MarkAttendanceRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Attendance;
import com.smartcampus.model.AttendanceStatus;
import com.smartcampus.model.User;
import com.smartcampus.repository.AttendanceRepository;
import com.smartcampus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for attendance tracking operations.
 *
 * <p>
 * Handles marking attendance via QR scan, retrieving attendance history,
 * and computing attendance statistics.
 * </p>
 */
@Service
public class AttendanceService {

    private static final Logger logger = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
            UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    /**
     * Mark attendance for a user (via QR scan).
     * Prevents duplicate scans within 1 hour.
     */
    public AttendanceDto markAttendance(MarkAttendanceRequest request, User markedByUser) {
        // Validate the target user exists
        User targetUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", "id", request.getUserId()));

        // Prevent duplicate scans within 1 hour
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<Attendance> recentScans = attendanceRepository
                .findByUserIdAndMarkedAtAfter(request.getUserId(), oneHourAgo);

        if (!recentScans.isEmpty()) {
            throw new IllegalStateException(
                    "Attendance already marked for " + targetUser.getName()
                            + " within the last hour. Last scan: "
                            + recentScans.get(0).getMarkedAt());
        }

        // Create attendance record
        Attendance attendance = new Attendance();
        attendance.setUserId(targetUser.getId());
        attendance.setUserName(targetUser.getName());
        attendance.setUserEmail(targetUser.getEmail());
        attendance.setStatus(request.getStatus() != null
                ? request.getStatus()
                : AttendanceStatus.PRESENT);
        attendance.setMarkedAt(LocalDateTime.now());
        attendance.setMarkedBy(markedByUser.getId());
        attendance.setMarkedByName(markedByUser.getName());
        attendance.setLocation(request.getLocation());
        attendance.setNotes(request.getNotes());

        Attendance saved = attendanceRepository.save(attendance);
        logger.info("Attendance marked for {} by {} (status: {})",
                targetUser.getEmail(), markedByUser.getEmail(), saved.getStatus());

        return mapToDto(saved);
    }

    /**
     * Get the authenticated user's own attendance history.
     */
    public List<AttendanceDto> getMyAttendance(String userId) {
        return attendanceRepository.findByUserIdOrderByMarkedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all attendance records (admin/manager view).
     */
    public List<AttendanceDto> getAllAttendance() {
        return attendanceRepository.findAllByOrderByMarkedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get attendance records for a specific user (admin/manager view).
     */
    public List<AttendanceDto> getUserAttendance(String userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return attendanceRepository.findByUserIdOrderByMarkedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get attendance stats for a specific user.
     */
    public AttendanceStatsDto getUserStats(String userId) {
        long total = attendanceRepository.countByUserId(userId);
        long present = attendanceRepository.countByUserIdAndStatus(userId, AttendanceStatus.PRESENT);
        long late = attendanceRepository.countByUserIdAndStatus(userId, AttendanceStatus.LATE);
        long absent = attendanceRepository.countByUserIdAndStatus(userId, AttendanceStatus.ABSENT);
        double rate = total > 0 ? ((double) (present + late) / total) * 100.0 : 0.0;

        return new AttendanceStatsDto(total, present, late, absent, Math.round(rate * 10.0) / 10.0);
    }

    /**
     * Get overall attendance stats (admin/manager view).
     */
    public AttendanceStatsDto getOverallStats() {
        List<Attendance> all = attendanceRepository.findAll();
        long total = all.size();
        long present = all.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long late = all.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        long absent = all.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        double rate = total > 0 ? ((double) (present + late) / total) * 100.0 : 0.0;

        return new AttendanceStatsDto(total, present, late, absent, Math.round(rate * 10.0) / 10.0);
    }

    /**
     * Map an Attendance entity to AttendanceDto.
     */
    private AttendanceDto mapToDto(Attendance attendance) {
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setUserId(attendance.getUserId());
        dto.setUserName(attendance.getUserName());
        dto.setUserEmail(attendance.getUserEmail());
        dto.setStatus(attendance.getStatus());
        dto.setMarkedAt(attendance.getMarkedAt() != null ? attendance.getMarkedAt().toString() : null);
        dto.setMarkedBy(attendance.getMarkedBy());
        dto.setMarkedByName(attendance.getMarkedByName());
        dto.setLocation(attendance.getLocation());
        dto.setNotes(attendance.getNotes());
        dto.setCreatedAt(attendance.getCreatedAt() != null ? attendance.getCreatedAt().toString() : null);
        return dto;
    }
}
