package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.CreateDriverRatingRequest;
import com.smartcampus.dto.DriverRatingDto;
import com.smartcampus.service.DriverRatingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shuttles/{id}/ratings")
public class DriverRatingController {

    private final DriverRatingService ratingService;

    public DriverRatingController(DriverRatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverRatingDto>>> getRatings(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Ratings retrieved", ratingService.getRatingsByShuttleId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DriverRatingDto>> createRating(
            @PathVariable String id,
            @Valid @RequestBody CreateDriverRatingRequest request,
            Authentication authentication) {
        
        String userId = authentication != null ? authentication.getName() : null;
        DriverRatingDto created = ratingService.createRating(id, request, userId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Rating submitted successfully", created));
    }
}
