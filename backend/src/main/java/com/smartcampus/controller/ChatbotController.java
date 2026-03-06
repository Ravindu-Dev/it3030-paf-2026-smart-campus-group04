package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.ChatRequest;
import com.smartcampus.dto.ChatResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the AI Chatbot feature.
 *
 * <p>
 * Endpoints:
 * </p>
 * <ul>
 * <li>POST /api/chatbot/chat — Send a message and receive an AI response
 * (authenticated users only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * Extract the user ID from the Authentication principal.
     */
    private String getUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        return authentication.getName();
    }

    /**
     * POST /api/chatbot/chat — Send a message to the AI chatbot.
     * Requires authentication. The chatbot only answers Smart Campus questions.
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        String reply = chatbotService.chat(request.getMessage(), userId);
        ChatResponse response = ChatResponse.of(reply);

        return ResponseEntity.ok(
                ApiResponse.success("Chatbot response generated", response));
    }
}
