package com.smartcampus.dto;

import com.smartcampus.model.TicketCategory;
import com.smartcampus.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating a new maintenance/incident ticket.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Description is required")
    private String description;

    private String contactEmail;
    private String contactPhone;

    @Size(max = 3, message = "Maximum 3 images allowed")
    private List<String> imageUrls;
}
