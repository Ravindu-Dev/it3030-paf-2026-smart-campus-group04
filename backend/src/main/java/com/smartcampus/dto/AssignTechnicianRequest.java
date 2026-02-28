package com.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for assigning a technician to a ticket.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignTechnicianRequest {

    @NotBlank(message = "Technician ID is required")
    private String technicianId;
}
