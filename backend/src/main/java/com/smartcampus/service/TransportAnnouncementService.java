package com.smartcampus.service;

import com.smartcampus.dto.CreateAnnouncementRequest;
import com.smartcampus.dto.TransportAnnouncementDto;
import com.smartcampus.model.TransportAnnouncement;
import com.smartcampus.repository.TransportAnnouncementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransportAnnouncementService {

    private final TransportAnnouncementRepository repository;

    public TransportAnnouncementService(TransportAnnouncementRepository repository) {
        this.repository = repository;
    }

    public TransportAnnouncementDto getActiveAnnouncement() {
        List<TransportAnnouncement> active = repository.findByIsActiveTrueOrderByCreatedAtDesc();
        if (active.isEmpty()) {
            return null;
        }
        return toDto(active.get(0));
    }

    public TransportAnnouncementDto createAnnouncement(CreateAnnouncementRequest request) {
        // Deactivate all existing active announcements
        List<TransportAnnouncement> existing = repository.findByIsActiveTrueOrderByCreatedAtDesc();
        existing.forEach(a -> a.setActive(false));
        repository.saveAll(existing);

        TransportAnnouncement announcement = new TransportAnnouncement();
        announcement.setMessage(request.getMessage());
        announcement.setActive(true);

        TransportAnnouncement saved = repository.save(announcement);
        return toDto(saved);
    }

    public void deactivateAnnouncement(String id) {
        repository.findById(id).ifPresent(a -> {
            a.setActive(false);
            repository.save(a);
        });
    }

    private TransportAnnouncementDto toDto(TransportAnnouncement announcement) {
        return new TransportAnnouncementDto(
                announcement.getId(),
                announcement.getMessage(),
                announcement.isActive(),
                announcement.getCreatedAt()
        );
    }
}
