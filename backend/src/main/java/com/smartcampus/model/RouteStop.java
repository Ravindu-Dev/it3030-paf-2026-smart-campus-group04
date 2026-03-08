package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteStop {
    private String name;
    private double latitude;
    private double longitude;
    private int orderIndex;
}
