package com.smartcampus.service;

import com.smartcampus.model.Maintenance;
import com.smartcampus.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository) {
        this.maintenanceRepository = maintenanceRepository;
    }

    public boolean isMaintenanceActive() {
        Optional<Maintenance> maintenanceOpt = maintenanceRepository.findFirstByOrderByStartTimeDesc();
        if (maintenanceOpt.isEmpty()) {
            return false;
        }

        Maintenance maintenance = maintenanceOpt.get();
        if (!maintenance.isEnabled()) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(maintenance.getStartTime()) && now.isBefore(maintenance.getEndTime());
    }

    public Maintenance getMaintenanceStatus() {
        return maintenanceRepository.findFirstByOrderByStartTimeDesc()
                .orElse(Maintenance.builder()
                        .enabled(false)
                        .startTime(LocalDateTime.now())
                        .endTime(LocalDateTime.now().plusHours(1))
                        .build());
    }

    public Maintenance enableMaintenance(LocalDateTime startTime, LocalDateTime endTime) {
        Maintenance maintenance = maintenanceRepository.findFirstByOrderByStartTimeDesc()
                .orElse(new Maintenance());
        
        maintenance.setStartTime(startTime);
        maintenance.setEndTime(endTime);
        maintenance.setEnabled(true);
        
        return maintenanceRepository.save(maintenance);
    }

    public Maintenance enableMaintenanceNow() {
        Maintenance maintenance = maintenanceRepository.findFirstByOrderByStartTimeDesc()
                .orElse(new Maintenance());

        maintenance.setEnabled(true);
        maintenance.setStartTime(LocalDateTime.now());                         // Active immediately
        maintenance.setEndTime(LocalDateTime.now().plusYears(100));            // No planned end

        return maintenanceRepository.save(maintenance);
    }

    public Maintenance disableMaintenance() {
        Maintenance maintenance = maintenanceRepository.findFirstByOrderByStartTimeDesc()
                .orElse(new Maintenance());
        
        maintenance.setEnabled(false);
        return maintenanceRepository.save(maintenance);
    }
}
