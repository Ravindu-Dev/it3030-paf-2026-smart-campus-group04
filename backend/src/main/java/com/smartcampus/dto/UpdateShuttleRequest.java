package com.smartcampus.dto;

import com.smartcampus.model.ShuttleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShuttleRequest {
    private String name;
    private String plateNumber;
    private String driverName;
    private String driverPhone;
    private ShuttleStatus status;
    private String routeId;
    private String imageUrl;
}
