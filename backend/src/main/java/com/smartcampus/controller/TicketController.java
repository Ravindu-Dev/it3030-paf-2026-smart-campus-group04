package com.smartcampus.controller;

import com.smartcampus.dto.*;
import com.smartcampus.model.Role;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Maintenance & Incident Ticketing (Module C).
 *
 * <p>
 * Endpoints:
 * </p>
 * <ul>
 * <li>POST /api/tickets — Create a ticket (authenticated user)</li>
 * <li>GET /api/tickets/my — Get current user's tickets</li>
 * <li>GET /api/tickets — Get all tickets (ADMIN, MANAGER)</li>
 * <li>GET /api/tickets/{id} — Get a single ticket</li>
 * <li>GET /api/tickets/technician — Get technician's assigned tickets</li>
 * <li>PATCH /api/tickets/{id}/assign — Assign technician (ADMIN, MANAGER)</li>
 * <li>PATCH /api/tickets/{id}/status — Update ticket status</li>
 * <li>PATCH /api/tickets/{id}/reject — Reject ticket (ADMIN)</li>
 * <li>DELETE /api/tickets/{id} — Delete ticket (ADMIN)</li>
 * <li>POST /api/tickets/{id}/comments — Add comment</li>
 * <li>GET /api/tickets/{id}/comments — Get comments</li>
 * <li>PUT /api/tickets/{id}/comments/{commentId} — Edit comment</li>
 * <li>DELETE /api/tickets/{id}/comments/{commentId} — Delete comment</li>
 * </ul>
 */
@RestController
@RequestMapping("/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // ─── Helper ───────────────────────────────────────────────────────

    private String getUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        }
        return authentication.getName();
    }

    private User getUser(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        return null;
    }

    // ─── Ticket Endpoints ─────────────────────────────────────────────

    /**
     * POST /api/tickets — Create a new ticket.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TicketDto>> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        TicketDto created = ticketService.createTicket(request, userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", created));
    }

    /**
     * GET /api/tickets/my — Get the current user's tickets.
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TicketDto>>> getMyTickets(
            Authentication authentication) {

        String userId = getUserId(authentication);
        List<TicketDto> tickets = ticketService.getUserTickets(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User tickets retrieved successfully", tickets));
    }

    /**
     * GET /api/tickets — Get all tickets (admin/manager only).
     * Supports optional filters: ?status=OPEN&priority=HIGH
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<TicketDto>>> getAllTickets(
            @RequestParam(name = "status", required = false) TicketStatus status,
            @RequestParam(name = "priority", required = false) TicketPriority priority) {

        List<TicketDto> tickets = ticketService.getAllTickets(status, priority);

        return ResponseEntity.ok(
                ApiResponse.success("All tickets retrieved successfully", tickets));
    }

    /**
     * GET /api/tickets/{id} — Get a single ticket by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDto>> getTicketById(
            @PathVariable(name = "id") String id) {

        TicketDto ticket = ticketService.getTicketById(id);

        return ResponseEntity.ok(
                ApiResponse.success("Ticket retrieved successfully", ticket));
    }

    /**
     * GET /api/tickets/technician — Get tickets assigned to the current technician.
     */
    @GetMapping("/technician")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<TicketDto>>> getTechnicianTickets(
            Authentication authentication) {

        String techId = getUserId(authentication);
        List<TicketDto> tickets = ticketService.getTicketsByTechnician(techId);

        return ResponseEntity.ok(
                ApiResponse.success("Technician tickets retrieved successfully", tickets));
    }

    /**
     * PATCH /api/tickets/{id}/assign — Assign a technician to a ticket.
     * Restricted to ADMIN and MANAGER roles.
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<TicketDto>> assignTechnician(
            @PathVariable(name = "id") String id,
            @Valid @RequestBody AssignTechnicianRequest request,
            Authentication authentication) {

        String assignerId = getUserId(authentication);
        TicketDto updated = ticketService.assignTechnician(id, request, assignerId);

        return ResponseEntity.ok(
                ApiResponse.success("Technician assigned successfully", updated));
    }

    /**
     * PATCH /api/tickets/{id}/status — Update ticket status.
     * Allowed for ADMIN and TECHNICIAN roles.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketDto>> updateTicketStatus(
            @PathVariable(name = "id") String id,
            @RequestParam(name = "newStatus") TicketStatus newStatus,
            @RequestBody(required = false) UpdateTicketStatusRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        TicketDto updated = ticketService.updateStatus(id, newStatus, request, userId);

        return ResponseEntity.ok(
                ApiResponse.success("Ticket status updated successfully", updated));
    }

    /**
     * PATCH /api/tickets/{id}/reject — Reject a ticket.
     * Restricted to ADMIN role.
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketDto>> rejectTicket(
            @PathVariable(name = "id") String id,
            @RequestBody UpdateTicketStatusRequest request,
            Authentication authentication) {

        String adminId = getUserId(authentication);
        TicketDto rejected = ticketService.rejectTicket(id, request, adminId);

        return ResponseEntity.ok(
                ApiResponse.success("Ticket rejected successfully", rejected));
    }

    /**
     * DELETE /api/tickets/{id} — Delete a ticket.
     * Restricted to ADMIN role.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable(name = "id") String id) {

        ticketService.deleteTicket(id);

        return ResponseEntity.ok(
                ApiResponse.success("Ticket deleted successfully"));
    }

    // ─── Comment Endpoints ────────────────────────────────────────────

    /**
     * POST /api/tickets/{id}/comments — Add a comment to a ticket.
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<TicketCommentDto>> addComment(
            @PathVariable(name = "id") String ticketId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        TicketCommentDto comment = ticketService.addComment(ticketId, request, userId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added successfully", comment));
    }

    /**
     * GET /api/tickets/{id}/comments — Get all comments for a ticket.
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<TicketCommentDto>>> getComments(
            @PathVariable(name = "id") String ticketId) {

        List<TicketCommentDto> comments = ticketService.getComments(ticketId);

        return ResponseEntity.ok(
                ApiResponse.success("Comments retrieved successfully", comments));
    }

    /**
     * PUT /api/tickets/{id}/comments/{commentId} — Edit a comment (owner only).
     */
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<TicketCommentDto>> updateComment(
            @PathVariable(name = "id") String ticketId,
            @PathVariable(name = "commentId") String commentId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        String userId = getUserId(authentication);
        TicketCommentDto updated = ticketService.updateComment(commentId, request, userId);

        return ResponseEntity.ok(
                ApiResponse.success("Comment updated successfully", updated));
    }

    /**
     * DELETE /api/tickets/{id}/comments/{commentId} — Delete a comment (owner or
     * admin).
     */
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable(name = "id") String ticketId,
            @PathVariable(name = "commentId") String commentId,
            Authentication authentication) {

        User user = getUser(authentication);
        String userId = user != null ? user.getId() : getUserId(authentication);
        Role userRole = user != null ? user.getRole() : Role.USER;

        ticketService.deleteComment(commentId, userId, userRole);

        return ResponseEntity.ok(
                ApiResponse.success("Comment deleted successfully"));
    }
}
