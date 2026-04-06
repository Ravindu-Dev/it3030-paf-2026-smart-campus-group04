package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.CreateLostFoundItemRequest;
import com.smartcampus.dto.LostFoundItemDto;
import com.smartcampus.dto.UpdateLostFoundItemRequest;
import com.smartcampus.model.LostFoundItemCategory;
import com.smartcampus.model.LostFoundItemStatus;
import com.smartcampus.model.LostFoundItemType;
import com.smartcampus.model.User;
import com.smartcampus.service.LostFoundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lost-found")
public class LostFoundController {

    private final LostFoundService lostFoundService;

    public LostFoundController(LostFoundService lostFoundService) {
        this.lostFoundService = lostFoundService;
    }

    private String getUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        return authentication.getName();
    }

    /**
     * GET /api/lost-found — Browse all items (public).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LostFoundItemDto>>> getAllItems(
            @RequestParam(name = "type", required = false) LostFoundItemType type,
            @RequestParam(name = "status", required = false) LostFoundItemStatus status,
            @RequestParam(name = "category", required = false) LostFoundItemCategory category,
            @RequestParam(name = "search", required = false) String search) {

        List<LostFoundItemDto> items = lostFoundService.getAllItems(type, status, category, search);
        return ResponseEntity.ok(ApiResponse.success("Items retrieved successfully", items));
    }

    /**
     * GET /api/lost-found/{id} — Get a single item (public).
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LostFoundItemDto>> getItemById(@PathVariable(name = "id") String id) {
        LostFoundItemDto item = lostFoundService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success("Item retrieved successfully", item));
    }

    /**
     * GET /api/lost-found/my — Get items reported by the current user.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LostFoundItemDto>>> getMyItems(Authentication authentication) {
        String userId = getUserId(authentication);
        List<LostFoundItemDto> items = lostFoundService.getMyItems(userId);
        return ResponseEntity.ok(ApiResponse.success("Your items retrieved successfully", items));
    }

    /**
     * POST /api/lost-found — Report a lost or found item.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LostFoundItemDto>> reportItem(
            @Valid @RequestBody CreateLostFoundItemRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        LostFoundItemDto created = lostFoundService.reportItem(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item reported successfully", created));
    }

    /**
     * PATCH /api/lost-found/{id}/claim — Claim an item.
     */
    @PatchMapping("/{id}/claim")
    public ResponseEntity<ApiResponse<LostFoundItemDto>> claimItem(
            @PathVariable(name = "id") String id,
            Authentication authentication) {

        String userId = getUserId(authentication);
        LostFoundItemDto claimed = lostFoundService.claimItem(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Item claimed successfully", claimed));
    }

    /**
     * PATCH /api/lost-found/{id}/close — Close a resolved item (admin only).
     */
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LostFoundItemDto>> closeItem(
            @PathVariable(name = "id") String id,
            @RequestBody(required = false) UpdateLostFoundItemRequest request) {

        LostFoundItemDto closed = lostFoundService.closeItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Item closed successfully", closed));
    }

    /**
     * DELETE /api/lost-found/{id} — Delete an item (admin only).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable(name = "id") String id) {
        lostFoundService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deleted successfully"));
    }
}
