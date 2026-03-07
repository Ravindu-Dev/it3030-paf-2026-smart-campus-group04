package com.smartcampus.dto;

public class RecommendationDto {
    private FacilityDto facility;
    private String reason;

    public RecommendationDto() {
    }

    public RecommendationDto(FacilityDto facility, String reason) {
        this.facility = facility;
        this.reason = reason;
    }

    public FacilityDto getFacility() {
        return facility;
    }

    public void setFacility(FacilityDto facility) {
        this.facility = facility;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
