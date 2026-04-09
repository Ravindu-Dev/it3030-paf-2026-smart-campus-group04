package com.smartcampus.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartcampus.dto.BookingDto;
import com.smartcampus.dto.FacilityDto;
import com.smartcampus.dto.RecommendationDto;
import com.smartcampus.model.FacilityStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final FacilityService facilityService;
    private final BookingService bookingService;

    @Value("${app.gemini.recommendation-api-key}")
    private String apiKey;

    public RecommendationService(FacilityService facilityService, BookingService bookingService) {
        this.facilityService = facilityService;
        this.bookingService = bookingService;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public List<RecommendationDto> getRecommendationsForUser(String userId) {
        try {
            // 1. Fetch user's booking history
            List<BookingDto> userBookings = bookingService.getUserBookings(userId, null);

            // 2. Fetch all active facilities
            List<FacilityDto> activeFacilities = facilityService.getAllFacilities(null, FacilityStatus.ACTIVE, null,
                    null, null);

            if (activeFacilities.isEmpty()) {
                return Collections.emptyList();
            }

            // If user has no bookings, skip AI and return popular/random fallback
            // immediately
            if (userBookings.isEmpty()) {
                log.info("User {} has no bookings. Generating fallback recommendations.", userId);
                return generateFallbackRecommendations(activeFacilities);
            }

            // 3. Prepare AI Prompt Context
            String prompt = buildPrompt(userBookings, activeFacilities);
            ObjectNode requestBody = buildGeminiRequest(prompt);

            // 4. Call Gemini API
            String responseJson = callGeminiApi(requestBody);
            JsonNode response = objectMapper.readTree(responseJson);

            // 5. Parse Gemini response
            if (response.has("error") || !response.has("candidates")) {
                log.warn("Gemini API error or missing candidates: {}. Falling back.", responseJson);
                return generateFallbackRecommendations(activeFacilities);
            }

            JsonNode textNode = response.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            String jsonText = extractJsonArrayString(textNode.asText());

            JsonNode recommendationsArray = objectMapper.readTree(jsonText);

            if (!recommendationsArray.isArray() || recommendationsArray.isEmpty()) {
                log.warn("AI returned invalid JSON array. Falling back.");
                return generateFallbackRecommendations(activeFacilities);
            }

            // 6. Map JSON to RecommendationDto
            List<RecommendationDto> recommendations = new ArrayList<>();
            Map<String, FacilityDto> facilityMap = activeFacilities.stream()
                    .collect(Collectors.toMap(FacilityDto::getId, f -> f));

            for (JsonNode recNode : recommendationsArray) {
                String facilityId = recNode.path("facilityId").asText();
                String reason = recNode.path("reason").asText();

                if (facilityMap.containsKey(facilityId)) {
                    recommendations.add(new RecommendationDto(facilityMap.get(facilityId), reason));
                }
            }

            // Fallback if AI gave bad IDs
            if (recommendations.isEmpty()) {
                return generateFallbackRecommendations(activeFacilities);
            }

            return recommendations;

        } catch (Exception e) {
            log.error("Error generating recommendations for user {}: {}", userId, e.getMessage(), e);
            // On any exception, fetch active facilities and return fallback
            List<FacilityDto> activeFacilities = facilityService.getAllFacilities(null, FacilityStatus.ACTIVE, null,
                    null, null);
            return generateFallbackRecommendations(activeFacilities);
        }
    }

    private String buildPrompt(List<BookingDto> bookings, List<FacilityDto> facilities) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an AI recommendation engine for a Smart Campus application.\n");
        sb.append(
                "Your task is to recommend exactly 3 facilities for the user to book next, based on their past booking history.\n");
        sb.append(
                "You MUST return ONLY a raw JSON array. DO NOT include code blocks (like ```json). DO NOT include any other text.\n");
        sb.append("The JSON array must contain objects with exactly two keys: 'facilityId' and 'reason'.\n");
        sb.append(
                "The 'reason' should be a friendly, engaging 1-sentence explanation of why this is recommended based on their history (e.g. 'Since you often book labs, you might like this newly available research space.').\n\n");

        sb.append("=== USER'S PAST BOOKINGS ===\n");
        for (int i = 0; i < Math.min(bookings.size(), 10); i++) {
            BookingDto b = bookings.get(i);
            sb.append(String.format("- Purpose: '%s', Facility Name: '%s'\n",
                    b.getPurpose() != null ? b.getPurpose() : "N/A", b.getFacilityName()));
        }
        sb.append("\n");

        sb.append("=== AVAILABLE FACILITIES FOR RECOMMENDATION ===\n");
        for (FacilityDto f : facilities) {
            sb.append(String.format("- ID: '%s', Name: '%s', Type: '%s', Capacity: %d\n",
                    f.getId(), f.getName(), f.getType(), f.getCapacity() != null ? f.getCapacity() : 0));
        }

        return sb.toString();
    }

    private ObjectNode buildGeminiRequest(String prompt) {
        ObjectNode root = objectMapper.createObjectNode();

        ArrayNode contents = objectMapper.createArrayNode();
        ObjectNode userContent = objectMapper.createObjectNode();
        userContent.put("role", "user");
        ArrayNode userParts = objectMapper.createArrayNode();
        ObjectNode textPart = objectMapper.createObjectNode();
        textPart.put("text", prompt);
        userParts.add(textPart);
        userContent.set("parts", userParts);
        contents.add(userContent);

        root.set("contents", contents);

        // Settings to encourage strict JSON
        ObjectNode generationConfig = objectMapper.createObjectNode();
        generationConfig.put("temperature", 0.2);
        generationConfig.put("response_mime_type", "application/json");
        root.set("generationConfig", generationConfig);

        return root;
    }

    private String callGeminiApi(ObjectNode requestBody) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody.toString(), headers);

            return restTemplate.postForObject(GEMINI_API_URL + "?key=" + apiKey, requestEntity, String.class);
        } catch (Exception e) {
            log.error("HTTP error calling Gemini: {}", e.getMessage());
            return "{\"error\":\"HTTP Request Failed\"}";
        }
    }

    private String extractJsonArrayString(String rawText) {
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private List<RecommendationDto> generateFallbackRecommendations(List<FacilityDto> activeFacilities) {
        List<RecommendationDto> fallback = new ArrayList<>();

        // Shuffle to simulate "Discovery"
        List<FacilityDto> shuffled = new ArrayList<>(activeFacilities);
        Collections.shuffle(shuffled);

        for (int i = 0; i < Math.min(3, shuffled.size()); i++) {
            FacilityDto f = shuffled.get(i);
            fallback.add(new RecommendationDto(f, "Popular facility recommended just for you."));
        }

        return fallback;
    }
}
