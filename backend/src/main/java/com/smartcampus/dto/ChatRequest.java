package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for the chatbot endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    /** The user's message to the chatbot */
    @NotBlank(message = "Message cannot be empty")
    private String message;
}
