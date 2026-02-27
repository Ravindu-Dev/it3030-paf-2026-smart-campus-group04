package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for admin approve/reject actions.
 * Remarks are optional for approval but required for rejection (enforced in
 * service layer).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingStatusRequest {

    /** Admin remarks — reason for approval/rejection */
    private String remarks;
}
