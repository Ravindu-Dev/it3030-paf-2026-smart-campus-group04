package com.smartcampus.service;

import com.smartcampus.dto.CreateDriverRatingRequest;
import com.smartcampus.dto.DriverRatingDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.DriverRating;
import com.smartcampus.model.Shuttle;
import com.smartcampus.repository.DriverRatingRepository;
import com.smartcampus.repository.ShuttleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverRatingService {

    private final DriverRatingRepository ratingRepository;
    private final ShuttleRepository shuttleRepository;

    public DriverRatingService(DriverRatingRepository ratingRepository, ShuttleRepository shuttleRepository) {
        this.ratingRepository = ratingRepository;
        this.shuttleRepository = shuttleRepository;
    }

    public DriverRatingDto createRating(String shuttleId, CreateDriverRatingRequest request, String userId) {
        Shuttle shuttle = shuttleRepository.findById(shuttleId)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttle", "id", shuttleId));

        DriverRating rating = new DriverRating();
        rating.setShuttleId(shuttleId);
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());
        rating.setUserId(userId);

        DriverRating saved = ratingRepository.save(rating);

        // Update Shuttle's average rating
        List<DriverRating> allRatings = ratingRepository.findByShuttleIdOrderByCreatedAtDesc(shuttleId);
        double avg = allRatings.stream().mapToInt(DriverRating::getRating).average().orElse(0.0);
        
        shuttle.setAverageRating(Math.round(avg * 10.0) / 10.0); // Round to 1 decimal place
        shuttle.setTotalRatings(allRatings.size());
        shuttleRepository.save(shuttle);

        return toDto(saved);
    }

    public List<DriverRatingDto> getRatingsByShuttleId(String shuttleId) {
        if (!shuttleRepository.existsById(shuttleId)) {
            throw new ResourceNotFoundException("Shuttle", "id", shuttleId);
        }
        return ratingRepository.findByShuttleIdOrderByCreatedAtDesc(shuttleId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private DriverRatingDto toDto(DriverRating rating) {
        return new DriverRatingDto(
                rating.getId(),
                rating.getShuttleId(),
                rating.getRating(),
                rating.getComment(),
                rating.getUserId(),
                rating.getCreatedAt()
        );
    }
}
