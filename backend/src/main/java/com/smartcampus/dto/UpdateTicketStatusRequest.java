package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating ticket status.
 * Used for status transitions and rejection with reason.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketStatusRequest {

    /** Optional remarks — used as rejection reason or resolution notes */
    private String remarks;
}
