package com.smartcampus.controller;

import com.smartcampus.model.Maintenance;
import com.smartcampus.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Maintenance maintenance = maintenanceService.getMaintenanceStatus();
        boolean isActive = maintenanceService.isMaintenanceActive();
        
        return ResponseEntity.ok(Map.of(
                "isActive", isActive,
                "enabled", maintenance.isEnabled(),
                "startTime", maintenance.getStartTime(),
                "endTime", maintenance.getEndTime()
        ));
    }

    @PostMapping("/enable-now")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enableNow() {
        Maintenance maintenance = maintenanceService.enableMaintenanceNow();
        return ResponseEntity.ok(maintenance);
    }

    @PostMapping("/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> enable(@RequestBody Map<String, String> request) {
        LocalDateTime startTime = LocalDateTime.parse(request.get("startTime"));
        LocalDateTime endTime = LocalDateTime.parse(request.get("endTime"));
        
        Maintenance maintenance = maintenanceService.enableMaintenance(startTime, endTime);
        return ResponseEntity.ok(maintenance);
    }

    @PostMapping("/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> disable() {
        Maintenance maintenance = maintenanceService.disableMaintenance();
        return ResponseEntity.ok(maintenance);
    }
}
