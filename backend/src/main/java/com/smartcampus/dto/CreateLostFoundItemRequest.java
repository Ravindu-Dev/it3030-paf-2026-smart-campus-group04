package com.smartcampus.dto;

import com.smartcampus.model.LostFoundItemCategory;
import com.smartcampus.model.LostFoundItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLostFoundItemRequest {

    @NotNull(message = "Type (LOST or FOUND) is required")
    private LostFoundItemType type;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private LostFoundItemCategory category;

    private String location;

    private LocalDate dateOccurred;

    private String imageUrl;

    private String contactEmail;

    private String contactPhone;
}
