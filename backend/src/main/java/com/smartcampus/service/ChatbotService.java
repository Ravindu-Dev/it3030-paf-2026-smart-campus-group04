package com.smartcampus.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartcampus.dto.BookingDto;
import com.smartcampus.dto.FacilityDto;
import com.smartcampus.dto.TicketDto;
import com.smartcampus.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service that integrates with the Google Gemini API (via REST) to provide
 * an AI-powered chatbot scoped exclusively to Smart Campus data.
 *
 * <p>
 * Uses Gemini's function-calling feature to dynamically query live system
 * data through the existing services (FacilityService, BookingService,
 * TicketService).
 * </p>
 */
@Service
public class ChatbotService {

        private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

        private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

        /**
         * System instruction that constrains the chatbot to only answer
         * Smart Campus related questions.
         */
        private static final String SYSTEM_INSTRUCTION = """
                        You are the Smart Campus Assistant — an AI chatbot built into the Smart Campus Operations Hub.

                        YOUR CAPABILITIES:
                        - Answer questions about campus facilities (labs, lecture halls, meeting rooms, equipment)
                        - Look up bookings for facilities, check availability, show time slots
                        - Provide information about maintenance/incident tickets
                        - Help users understand the system features and how to use them

                        YOUR RULES:
                        1. You MUST ONLY answer questions related to the Smart Campus system.
                        2. If someone asks a general knowledge question (e.g., "What is the highest mountain?",
                           "Who is the president?", "Write me a poem"), politely decline and redirect them to
                           ask about campus facilities, bookings, or tickets.
                        3. Be friendly, concise, and helpful.
                        4. When presenting data, format it nicely with bullet points or numbered lists.
                        5. If no data is found, say so clearly and suggest what the user can do.
                        6. Use emojis sparingly to make responses feel friendly (🏫 📅 🔧 ✅).
                        7. When presenting time values, convert them to a human-readable format (e.g., "2:00 PM" instead of "14:00").
                        8. You can answer general questions about how the Smart Campus system works,
                           what features it has, and how to navigate the application.
                        9. The system has these modules: Facilities & Assets Catalogue, Booking Management,
                           Maintenance & Incident Ticketing, Notifications, and User Management.
                        10. Available facility types: LECTURE_HALL, LAB, MEETING_ROOM, PROJECTOR, CAMERA, OTHER_EQUIPMENT.
                        11. Booking statuses: PENDING, APPROVED, REJECTED, CANCELLED.
                        12. Ticket statuses: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED.
                        13. Ticket categories: ELECTRICAL, PLUMBING, HVAC, IT_EQUIPMENT, FURNITURE, STRUCTURAL, CLEANING, SAFETY, OTHER.
                        14. User roles: USER, ADMIN, TECHNICIAN, MANAGER.
                        """;

        private final WebClient webClient;
        private final ObjectMapper objectMapper;
        private final FacilityService facilityService;
        private final BookingService bookingService;
        private final TicketService ticketService;

        @Value("${app.gemini.api-key}")
        private String apiKey;

        public ChatbotService(FacilityService facilityService,
                        BookingService bookingService,
                        TicketService ticketService) {
                this.facilityService = facilityService;
                this.bookingService = bookingService;
                this.ticketService = ticketService;
                this.webClient = WebClient.builder().build();
                this.objectMapper = new ObjectMapper();
        }

        /**
         * Process a user message through the Gemini API with function calling.
         *
         * @param userMessage the user's question
         * @param userId      the authenticated user's ID
         * @return the chatbot's response text
         */
        public String chat(String userMessage, String userId) {
                try {
                        // Build the initial request with function declarations
                        ObjectNode requestBody = buildGeminiRequest(userMessage);
                        log.debug("Sending message to Gemini: {}", userMessage);

                        // First call — Gemini may respond directly or request a function call
                        String responseJson = callGeminiApi(requestBody);
                        JsonNode response = objectMapper.readTree(responseJson);

                        // Check for API error response (e.g., rate limiting, bad key)
                        if (response.has("error")) {
                                String errorMsg = response.path("error").path("message").asText("Unknown error");
                                int code = response.path("error").path("code").asInt(0);
                                log.error("Gemini API error (code {}): {}", code, errorMsg);
                                if (code == 429) {
                                        return "I'm currently receiving too many requests. Please wait a moment and try again. ⏳";
                                }
                                return "I encountered an issue processing your request. Please try again shortly. 🔧";
                        }

                        // Check if Gemini wants to call a function
                        JsonNode candidates = response.path("candidates");
                        if (candidates.isEmpty()) {
                                log.warn("No candidates in Gemini response: {}", responseJson);
                                return "I'm sorry, I couldn't process your request right now. Please try again.";
                        }

                        JsonNode parts = candidates.get(0).path("content").path("parts");
                        if (parts.isEmpty()) {
                                return "I'm sorry, I couldn't process your request right now. Please try again.";
                        }

                        JsonNode firstPart = parts.get(0);

                        // If there's a function call, execute it and send result back
                        if (firstPart.has("functionCall")) {
                                return handleFunctionCall(firstPart.get("functionCall"), userMessage, userId,
                                                requestBody);
                        }

                        // Otherwise, return the text response directly
                        return firstPart.path("text").asText(
                                        "I'm sorry, I couldn't understand that. Try asking about facilities, bookings, or tickets!");

                } catch (WebClientResponseException e) {
                        log.error("Gemini API HTTP error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
                        if (e.getStatusCode().value() == 429) {
                                return "I'm currently receiving too many requests. Please wait a few seconds and try again. ⏳";
                        }
                        return "I'm experiencing technical difficulties right now. Please try again in a moment. 🔧";
                } catch (Exception e) {
                        log.error("Error communicating with Gemini API: {}", e.getMessage(), e);
                        return "I'm experiencing technical difficulties right now. Please try again in a moment. 🔧";
                }
        }

        /**
         * Build the full Gemini API request body including system instruction,
         * user message, and function declarations.
         */
        private ObjectNode buildGeminiRequest(String userMessage) {
                ObjectNode root = objectMapper.createObjectNode();

                // System instruction
                ObjectNode systemInstruction = objectMapper.createObjectNode();
                ObjectNode systemPart = objectMapper.createObjectNode();
                systemPart.put("text", SYSTEM_INSTRUCTION);
                ArrayNode systemParts = objectMapper.createArrayNode();
                systemParts.add(systemPart);
                systemInstruction.set("parts", systemParts);
                root.set("system_instruction", systemInstruction);

                // User message
                ArrayNode contents = objectMapper.createArrayNode();
                ObjectNode userContent = objectMapper.createObjectNode();
                userContent.put("role", "user");
                ArrayNode userParts = objectMapper.createArrayNode();
                ObjectNode textPart = objectMapper.createObjectNode();
                textPart.put("text", userMessage);
                userParts.add(textPart);
                userContent.set("parts", userParts);
                contents.add(userContent);
                root.set("contents", contents);

                // Tool / function declarations
                ArrayNode tools = objectMapper.createArrayNode();
                ObjectNode tool = objectMapper.createObjectNode();
                tool.set("function_declarations", buildFunctionDeclarations());
                tools.add(tool);
                root.set("tools", tools);

                return root;
        }

        /**
         * Define all functions that Gemini can call to query system data.
         */
        private ArrayNode buildFunctionDeclarations() {
                ArrayNode functions = objectMapper.createArrayNode();

                // 1. searchFacilities — search/filter the facility catalogue
                functions.add(buildFunction(
                                "searchFacilities",
                                "Search for campus facilities (labs, lecture halls, meeting rooms, equipment). Can filter by type, location, or keyword.",
                                objectMapper.createObjectNode()
                                                .put("type", "object")
                                                .<ObjectNode>set("properties", objectMapper.createObjectNode()
                                                                .<ObjectNode>set("type", objectMapper.createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "Filter by facility type: LECTURE_HALL, LAB, MEETING_ROOM, PROJECTOR, CAMERA, OTHER_EQUIPMENT")
                                                                                .set("enum", objectMapper
                                                                                                .createArrayNode()
                                                                                                .add("LECTURE_HALL")
                                                                                                .add("LAB")
                                                                                                .add("MEETING_ROOM")
                                                                                                .add("PROJECTOR")
                                                                                                .add("CAMERA")
                                                                                                .add("OTHER_EQUIPMENT")))
                                                                .<ObjectNode>set("search", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "Keyword to search in facility name or description"))
                                                                .<ObjectNode>set("location", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "Filter by location (partial match)"))
                                                                .<ObjectNode>set("minCapacity", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "integer")
                                                                                .put("description",
                                                                                                "Minimum seating capacity")))));

                // 2. getFacilityDetails — get a specific facility by name or ID
                functions.add(buildFunction(
                                "getFacilityDetails",
                                "Get detailed information about a specific facility by searching for its name. Use this when the user asks about a specific room or resource.",
                                objectMapper.createObjectNode()
                                                .put("type", "object")
                                                .<ObjectNode>set("properties", objectMapper.createObjectNode()
                                                                .<ObjectNode>set("facilityName", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "The name of the facility to look up (e.g., 'Lab101', 'Room A101')")))
                                                .<ObjectNode>set("required",
                                                                objectMapper.createArrayNode().add("facilityName"))));

                // 3. getBookingsForFacility — list bookings for a specific facility
                functions.add(buildFunction(
                                "getBookingsForFacility",
                                "Get a list of bookings for a specific facility. Can filter by booking status. Use this when the user asks about bookings or availability of a room/resource.",
                                objectMapper.createObjectNode()
                                                .put("type", "object")
                                                .<ObjectNode>set("properties", objectMapper.createObjectNode()
                                                                .<ObjectNode>set("facilityName", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "The name of the facility to get bookings for"))
                                                                .<ObjectNode>set("status", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "Filter by booking status: PENDING, APPROVED, REJECTED, CANCELLED")
                                                                                .set("enum", objectMapper
                                                                                                .createArrayNode()
                                                                                                .add("PENDING")
                                                                                                .add("APPROVED")
                                                                                                .add("REJECTED")
                                                                                                .add("CANCELLED"))))
                                                .<ObjectNode>set("required",
                                                                objectMapper.createArrayNode().add("facilityName"))));

                // 4. getUserBookings — get the current user's bookings
                functions.add(buildFunction(
                                "getUserBookings",
                                "Get the current user's own bookings. Can filter by status. Use this when the user asks about 'my bookings' or their own reservations.",
                                objectMapper.createObjectNode()
                                                .put("type", "object")
                                                .<ObjectNode>set("properties", objectMapper.createObjectNode()
                                                                .<ObjectNode>set("status", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "Filter by booking status: PENDING, APPROVED, REJECTED, CANCELLED")
                                                                                .set("enum", objectMapper
                                                                                                .createArrayNode()
                                                                                                .add("PENDING")
                                                                                                .add("APPROVED")
                                                                                                .add("REJECTED")
                                                                                                .add("CANCELLED"))))));

                // 5. searchTickets — list maintenance/incident tickets
                functions.add(buildFunction(
                                "searchTickets",
                                "Search for maintenance and incident tickets. Can filter by status and priority. Use this when the user asks about tickets, issues, or maintenance reports.",
                                objectMapper.createObjectNode()
                                                .put("type", "object")
                                                .<ObjectNode>set("properties", objectMapper.createObjectNode()
                                                                .<ObjectNode>set("status", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "Filter by ticket status: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED")
                                                                                .set("enum", objectMapper
                                                                                                .createArrayNode()
                                                                                                .add("OPEN")
                                                                                                .add("IN_PROGRESS")
                                                                                                .add("RESOLVED")
                                                                                                .add("CLOSED")
                                                                                                .add("REJECTED")))
                                                                .<ObjectNode>set("priority", objectMapper
                                                                                .createObjectNode()
                                                                                .put("type", "string")
                                                                                .put("description",
                                                                                                "Filter by priority: LOW, MEDIUM, HIGH, CRITICAL")
                                                                                .set("enum", objectMapper
                                                                                                .createArrayNode()
                                                                                                .add("LOW")
                                                                                                .add("MEDIUM")
                                                                                                .add("HIGH")
                                                                                                .add("CRITICAL"))))));

                // 6. getUserTickets — get the current user's tickets
                functions.add(buildFunction(
                                "getUserTickets",
                                "Get the current user's own maintenance/incident tickets. Use this when the user asks about 'my tickets' or their own reported issues.",
                                objectMapper.createObjectNode()
                                                .put("type", "object")
                                                .<ObjectNode>set("properties", objectMapper.createObjectNode())));

                return functions;
        }

        /**
         * Helper to build a function declaration node.
         */
        private ObjectNode buildFunction(String name, String description, ObjectNode parameters) {
                ObjectNode fn = objectMapper.createObjectNode();
                fn.put("name", name);
                fn.put("description", description);
                fn.set("parameters", parameters);
                return fn;
        }

        /**
         * Execute a function call requested by Gemini, then send the result
         * back to get a final natural language response.
         */
        private String handleFunctionCall(JsonNode functionCall, String originalMessage,
                        String userId, ObjectNode originalRequest) {
                String functionName = functionCall.path("name").asText();
                JsonNode args = functionCall.path("args");

                log.info("Gemini requested function call: {} with args: {}", functionName, args);

                // Execute the function and get the data
                String functionResult = executeFunction(functionName, args, userId);

                // Build a follow-up request with the function response
                try {
                        ObjectNode followUp = buildFollowUpRequest(originalMessage, functionCall, functionResult);
                        String responseJson = callGeminiApi(followUp);
                        JsonNode response = objectMapper.readTree(responseJson);

                        JsonNode candidates = response.path("candidates");
                        if (!candidates.isEmpty()) {
                                JsonNode parts = candidates.get(0).path("content").path("parts");
                                if (!parts.isEmpty() && parts.get(0).has("text")) {
                                        return parts.get(0).path("text").asText();
                                }
                        }

                        return "I found some data but couldn't format a response. Please try rephrasing your question.";

                } catch (Exception e) {
                        log.error("Error processing function call response: {}", e.getMessage(), e);
                        return "I found some data but encountered an error while processing it. Please try again.";
                }
        }

        /**
         * Execute the actual function (query the database via existing services).
         */
        private String executeFunction(String functionName, JsonNode args, String userId) {
                try {
                        return switch (functionName) {
                                case "searchFacilities" -> executeSearchFacilities(args);
                                case "getFacilityDetails" -> executeGetFacilityDetails(args);
                                case "getBookingsForFacility" -> executeGetBookingsForFacility(args);
                                case "getUserBookings" -> executeGetUserBookings(args, userId);
                                case "searchTickets" -> executeSearchTickets(args);
                                case "getUserTickets" -> executeGetUserTickets(userId);
                                default -> "Unknown function: " + functionName;
                        };
                } catch (Exception e) {
                        log.error("Error executing function {}: {}", functionName, e.getMessage(), e);
                        return "Error retrieving data: " + e.getMessage();
                }
        }

        private String executeSearchFacilities(JsonNode args) {
                FacilityType type = args.has("type") ? FacilityType.valueOf(args.get("type").asText()) : null;
                String search = args.has("search") ? args.get("search").asText() : null;
                String location = args.has("location") ? args.get("location").asText() : null;
                Integer minCapacity = args.has("minCapacity") ? args.get("minCapacity").asInt() : null;

                List<FacilityDto> facilities = facilityService.getAllFacilities(
                                type, FacilityStatus.ACTIVE, location, minCapacity, search);

                if (facilities.isEmpty()) {
                        return "No facilities found matching the search criteria.";
                }

                return facilities.stream()
                                .map(f -> String.format(
                                                "Name: %s | Type: %s | Capacity: %s | Location: %s | Status: %s | Description: %s",
                                                f.getName(), f.getType(),
                                                f.getCapacity() != null ? f.getCapacity() : "N/A",
                                                f.getLocation() != null ? f.getLocation() : "N/A",
                                                f.getStatus(), f.getDescription() != null ? f.getDescription() : "N/A"))
                                .collect(Collectors.joining("\n"));
        }

        private String executeGetFacilityDetails(JsonNode args) {
                String facilityName = args.get("facilityName").asText();

                // Search by name
                List<FacilityDto> facilities = facilityService.getAllFacilities(
                                null, null, null, null, facilityName);

                if (facilities.isEmpty()) {
                        return "No facility found with the name '" + facilityName + "'.";
                }

                FacilityDto f = facilities.get(0);
                StringBuilder sb = new StringBuilder();
                sb.append("Facility: ").append(f.getName()).append("\n");
                sb.append("Type: ").append(f.getType()).append("\n");
                sb.append("Status: ").append(f.getStatus()).append("\n");
                sb.append("Location: ").append(f.getLocation() != null ? f.getLocation() : "N/A").append("\n");
                sb.append("Capacity: ").append(f.getCapacity() != null ? f.getCapacity() : "N/A").append("\n");
                sb.append("Description: ").append(f.getDescription() != null ? f.getDescription() : "N/A").append("\n");

                if (f.getAvailabilityWindows() != null && !f.getAvailabilityWindows().isEmpty()) {
                        sb.append("Availability Windows:\n");
                        f.getAvailabilityWindows().forEach(w -> sb.append("  - ").append(w.getDayOfWeek())
                                        .append(": ").append(w.getStartTime())
                                        .append(" - ").append(w.getEndTime()).append("\n"));
                }

                return sb.toString();
        }

        private String executeGetBookingsForFacility(JsonNode args) {
                String facilityName = args.get("facilityName").asText();

                // First find the facility by name
                List<FacilityDto> facilities = facilityService.getAllFacilities(
                                null, null, null, null, facilityName);

                if (facilities.isEmpty()) {
                        return "No facility found with the name '" + facilityName + "'.";
                }

                String facilityId = facilities.get(0).getId();
                BookingStatus status = args.has("status") ? BookingStatus.valueOf(args.get("status").asText()) : null;

                List<BookingDto> bookings = bookingService.getAllBookings(status, facilityId);

                if (bookings.isEmpty()) {
                        return "No bookings found for '" + facilityName + "'" +
                                        (status != null ? " with status " + status : "") + ".";
                }

                return bookings.stream()
                                .map(b -> String.format(
                                                "Date: %s | Time: %s - %s | Status: %s | Booked by: %s | Purpose: %s",
                                                b.getBookingDate(), b.getStartTime(), b.getEndTime(),
                                                b.getStatus(), b.getUserName(),
                                                b.getPurpose() != null ? b.getPurpose() : "N/A"))
                                .collect(Collectors.joining("\n"));
        }

        private String executeGetUserBookings(JsonNode args, String userId) {
                BookingStatus status = args.has("status") ? BookingStatus.valueOf(args.get("status").asText()) : null;

                List<BookingDto> bookings = bookingService.getUserBookings(userId, status);

                if (bookings.isEmpty()) {
                        return "You have no bookings" +
                                        (status != null ? " with status " + status : "") + ".";
                }

                return bookings.stream()
                                .map(b -> String.format(
                                                "Facility: %s | Date: %s | Time: %s - %s | Status: %s | Purpose: %s",
                                                b.getFacilityName(), b.getBookingDate(),
                                                b.getStartTime(), b.getEndTime(),
                                                b.getStatus(), b.getPurpose() != null ? b.getPurpose() : "N/A"))
                                .collect(Collectors.joining("\n"));
        }

        private String executeSearchTickets(JsonNode args) {
                TicketStatus status = args.has("status") ? TicketStatus.valueOf(args.get("status").asText()) : null;
                TicketPriority priority = args.has("priority") ? TicketPriority.valueOf(args.get("priority").asText())
                                : null;

                List<TicketDto> tickets = ticketService.getAllTickets(status, priority);

                if (tickets.isEmpty()) {
                        return "No tickets found" +
                                        (status != null ? " with status " + status : "") +
                                        (priority != null ? " with priority " + priority : "") + ".";
                }

                // Limit to 10 results to keep the response manageable
                return tickets.stream()
                                .limit(10)
                                .map(t -> String.format(
                                                "ID: %s | Facility: %s | Category: %s | Priority: %s | Status: %s | Description: %s",
                                                t.getId(), t.getFacilityName(), t.getCategory(),
                                                t.getPriority(), t.getStatus(),
                                                t.getDescription() != null
                                                                ? (t.getDescription().length() > 80
                                                                                ? t.getDescription().substring(0, 80)
                                                                                                + "..."
                                                                                : t.getDescription())
                                                                : "N/A"))
                                .collect(Collectors.joining("\n")) +
                                (tickets.size() > 10 ? "\n... and " + (tickets.size() - 10) + " more tickets." : "");
        }

        private String executeGetUserTickets(String userId) {
                List<TicketDto> tickets = ticketService.getUserTickets(userId);

                if (tickets.isEmpty()) {
                        return "You have no tickets.";
                }

                return tickets.stream()
                                .map(t -> String.format(
                                                "ID: %s | Facility: %s | Category: %s | Priority: %s | Status: %s | Description: %s",
                                                t.getId(), t.getFacilityName(), t.getCategory(),
                                                t.getPriority(), t.getStatus(),
                                                t.getDescription() != null
                                                                ? (t.getDescription().length() > 80
                                                                                ? t.getDescription().substring(0, 80)
                                                                                                + "..."
                                                                                : t.getDescription())
                                                                : "N/A"))
                                .collect(Collectors.joining("\n"));
        }

        /**
         * Build a follow-up request that includes the original conversation,
         * the function call, and the function response.
         */
        private ObjectNode buildFollowUpRequest(String originalMessage,
                        JsonNode functionCall,
                        String functionResult) {
                ObjectNode root = objectMapper.createObjectNode();

                // System instruction (same as before)
                ObjectNode systemInstruction = objectMapper.createObjectNode();
                ObjectNode systemPart = objectMapper.createObjectNode();
                systemPart.put("text", SYSTEM_INSTRUCTION);
                ArrayNode systemParts = objectMapper.createArrayNode();
                systemParts.add(systemPart);
                systemInstruction.set("parts", systemParts);
                root.set("system_instruction", systemInstruction);

                // Multi-turn contents
                ArrayNode contents = objectMapper.createArrayNode();

                // 1) User message
                ObjectNode userContent = objectMapper.createObjectNode();
                userContent.put("role", "user");
                ArrayNode userParts = objectMapper.createArrayNode();
                ObjectNode textPart = objectMapper.createObjectNode();
                textPart.put("text", originalMessage);
                userParts.add(textPart);
                userContent.set("parts", userParts);
                contents.add(userContent);

                // 2) Model's function call
                ObjectNode modelContent = objectMapper.createObjectNode();
                modelContent.put("role", "model");
                ArrayNode modelParts = objectMapper.createArrayNode();
                ObjectNode fcPart = objectMapper.createObjectNode();
                fcPart.set("functionCall", functionCall);
                modelParts.add(fcPart);
                modelContent.set("parts", modelParts);
                contents.add(modelContent);

                // 3) Function response
                ObjectNode functionResponseContent = objectMapper.createObjectNode();
                functionResponseContent.put("role", "user");
                ArrayNode functionResponseParts = objectMapper.createArrayNode();
                ObjectNode frPart = objectMapper.createObjectNode();

                ObjectNode functionResponse = objectMapper.createObjectNode();
                functionResponse.put("name", functionCall.path("name").asText());

                ObjectNode responseData = objectMapper.createObjectNode();
                responseData.put("result", functionResult);
                functionResponse.set("response", responseData);

                frPart.set("functionResponse", functionResponse);
                functionResponseParts.add(frPart);
                functionResponseContent.set("parts", functionResponseParts);
                contents.add(functionResponseContent);

                root.set("contents", contents);

                return root;
        }

        /**
         * Make the actual HTTP call to the Gemini REST API.
         * Uses onStatus to avoid throwing on 4xx/5xx so we can parse error JSON.
         * Retries up to 3 times with exponential backoff on 429 (rate limit) errors.
         */
        private String callGeminiApi(ObjectNode requestBody) {
                int maxRetries = 3;
                int retryDelayMs = 2000;

                for (int attempt = 1; attempt <= maxRetries; attempt++) {
                        String responseBody = webClient.post()
                                        .uri(GEMINI_API_URL + "?key=" + apiKey)
                                        .header("Content-Type", "application/json")
                                        .bodyValue(requestBody.toString())
                                        .exchangeToMono(response -> response.bodyToMono(String.class))
                                        .block();

                        // Check if it's a rate limit error and we can retry
                        try {
                                JsonNode parsed = objectMapper.readTree(responseBody);
                                if (parsed.has("error") && parsed.path("error").path("code").asInt() == 429
                                                && attempt < maxRetries) {
                                        log.warn("Gemini API rate limited (attempt {}/{}). Retrying in {}ms...",
                                                        attempt, maxRetries, retryDelayMs);
                                        Thread.sleep(retryDelayMs);
                                        retryDelayMs *= 2; // exponential backoff
                                        continue;
                                }
                        } catch (InterruptedException ie) {
                                Thread.currentThread().interrupt();
                        } catch (Exception e) {
                                // Not JSON or parse error — just return raw body
                        }

                        return responseBody;
                }

                return "{\"error\":{\"code\":429,\"message\":\"Rate limit exceeded after retries\"}}";
        }
}
