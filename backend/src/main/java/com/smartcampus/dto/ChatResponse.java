package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for the chatbot endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {

    /** The chatbot's reply */
    private String reply;

    /** Timestamp of the response */
    private LocalDateTime timestamp;

    public static ChatResponse of(String reply) {
        return new ChatResponse(reply, LocalDateTime.now());
    }
}
