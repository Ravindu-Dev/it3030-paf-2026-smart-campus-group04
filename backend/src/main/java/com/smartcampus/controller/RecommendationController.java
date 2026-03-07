package com.smartcampus.controller;

import com.smartcampus.dto.RecommendationDto;
import com.smartcampus.model.User;
import com.smartcampus.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    private String getUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        return authentication.getName();
    }

    @GetMapping
    public ResponseEntity<?> getRecommendations(Authentication authentication) {
        String userId = getUserId(authentication);
        List<RecommendationDto> recommendations = recommendationService.getRecommendationsForUser(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", recommendations);

        return ResponseEntity.ok(response);
    }
}
