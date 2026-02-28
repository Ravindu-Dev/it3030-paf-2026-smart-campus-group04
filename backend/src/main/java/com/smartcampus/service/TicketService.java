package com.smartcampus.service;

import com.smartcampus.dto.*;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.*;
import com.smartcampus.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Maintenance & Incident Ticketing (Module C).
 *
 * <p>
 * Handles ticket creation, workflow transitions, technician assignment,
 * and comment management with ownership rules.
 * </p>
 */
@Service
public class TicketService {

    private static final Logger logger = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository,
            TicketCommentRepository commentRepository,
            BookingRepository bookingRepository,
            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    // ─── Ticket CRUD ──────────────────────────────────────────────────

    /**
     * Create a new maintenance/incident ticket.
     * Validates that the booking exists and belongs to the user.
     */
    public TicketDto createTicket(CreateTicketRequest request, String userId) {
        // Validate booking exists and belongs to user
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", request.getBookingId()));

        if (!booking.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only create tickets for your own bookings");
        }

        // Get user details
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Build ticket
        Ticket ticket = new Ticket();
        ticket.setBookingId(request.getBookingId());
        ticket.setFacilityId(booking.getFacilityId());
        ticket.setFacilityName(booking.getFacilityName());
        ticket.setLocation(booking.getFacilityName()); // Use facility name as location fallback
        ticket.setUserId(userId);
        ticket.setUserName(user.getName());
        ticket.setUserEmail(user.getEmail());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setDescription(request.getDescription());
        ticket.setContactEmail(request.getContactEmail() != null ? request.getContactEmail() : user.getEmail());
        ticket.setContactPhone(request.getContactPhone());
        ticket.setImageUrls(request.getImageUrls() != null ? request.getImageUrls() : List.of());
        ticket.setStatus(TicketStatus.OPEN);

        Ticket saved = ticketRepository.save(ticket);
        logger.info("Ticket created: {} by user {} for facility {}", saved.getId(), userId, booking.getFacilityName());

        return mapToDto(saved);
    }

    /**
     * Get a ticket by its ID.
     */
    public TicketDto getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));
        return mapToDto(ticket);
    }

    /**
     * Get all tickets for the authenticated user.
     */
    public List<TicketDto> getUserTickets(String userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all tickets (admin/manager). Optional filters by status and priority.
     */
    public List<TicketDto> getAllTickets(TicketStatus status, TicketPriority priority) {
        List<Ticket> tickets;

        if (status != null && priority != null) {
            tickets = ticketRepository.findByStatusAndPriorityOrderByCreatedAtDesc(status, priority);
        } else if (status != null) {
            tickets = ticketRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (priority != null) {
            tickets = ticketRepository.findByPriorityOrderByCreatedAtDesc(priority);
        } else {
            tickets = ticketRepository.findAllByOrderByCreatedAtDesc();
        }

        return tickets.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get tickets assigned to a specific technician.
     */
    public List<TicketDto> getTicketsByTechnician(String technicianId) {
        return ticketRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc(technicianId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // ─── Workflow Transitions ─────────────────────────────────────────

    /**
     * Assign a technician to a ticket (admin/manager only).
     * Moves status to IN_PROGRESS.
     */
    public TicketDto assignTechnician(String ticketId, AssignTechnicianRequest request, String assignerId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalStateException("Cannot assign technician to a " + ticket.getStatus() + " ticket");
        }

        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", request.getTechnicianId()));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("User " + technician.getName() + " is not a technician");
        }

        ticket.setAssignedTechnicianId(technician.getId());
        ticket.setAssignedTechnicianName(technician.getName());
        ticket.setAssignedBy(assignerId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        Ticket saved = ticketRepository.save(ticket);
        logger.info("Ticket {} assigned to technician {} by {}", ticketId, technician.getName(), assignerId);

        return mapToDto(saved);
    }

    /**
     * Update ticket status (technician/admin).
     * Valid transitions: IN_PROGRESS → RESOLVED, RESOLVED → CLOSED
     */
    public TicketDto updateStatus(String ticketId, TicketStatus newStatus,
            UpdateTicketStatusRequest request, String userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        // Validate transition
        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED && request != null && request.getRemarks() != null) {
            ticket.setResolutionNotes(request.getRemarks());
        }

        Ticket saved = ticketRepository.save(ticket);
        logger.info("Ticket {} status updated to {} by user {}", ticketId, newStatus, userId);

        return mapToDto(saved);
    }

    /**
     * Reject a ticket (admin only). Requires a rejection reason.
     */
    public TicketDto rejectTicket(String ticketId, UpdateTicketStatusRequest request, String adminId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new IllegalStateException("Cannot reject a " + ticket.getStatus() + " ticket");
        }

        if (request == null || request.getRemarks() == null || request.getRemarks().isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(request.getRemarks());

        Ticket saved = ticketRepository.save(ticket);
        logger.info("Ticket {} rejected by admin {} — reason: {}", ticketId, adminId, request.getRemarks());

        return mapToDto(saved);
    }

    /**
     * Delete a ticket and its comments (admin only).
     */
    public void deleteTicket(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket", "id", ticketId);
        }
        commentRepository.deleteByTicketId(ticketId);
        ticketRepository.deleteById(ticketId);
        logger.info("Ticket {} and its comments deleted", ticketId);
    }

    // ─── Comments ─────────────────────────────────────────────────────

    /**
     * Add a comment to a ticket.
     */
    public TicketCommentDto addComment(String ticketId, CreateCommentRequest request, String userId) {
        // Validate ticket exists
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket", "id", ticketId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setUserId(userId);
        comment.setUserName(user.getName());
        comment.setUserProfilePicture(user.getProfilePicture());
        comment.setUserRole(user.getRole().name());
        comment.setContent(request.getContent());

        TicketComment saved = commentRepository.save(comment);
        logger.info("Comment added to ticket {} by user {}", ticketId, userId);

        return mapCommentToDto(saved);
    }

    /**
     * Get all comments for a ticket.
     */
    public List<TicketCommentDto> getComments(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket", "id", ticketId);
        }

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::mapCommentToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update a comment (owner only).
     */
    public TicketCommentDto updateComment(String commentId, CreateCommentRequest request, String userId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        TicketComment saved = commentRepository.save(comment);

        return mapCommentToDto(saved);
    }

    /**
     * Delete a comment (owner or admin).
     */
    public void deleteComment(String commentId, String userId, Role userRole) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUserId().equals(userId) && userRole != Role.ADMIN) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }

        commentRepository.deleteById(commentId);
        logger.info("Comment {} deleted by user {}", commentId, userId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    /**
     * Validate status transitions.
     */
    private void validateStatusTransition(TicketStatus current, TicketStatus target) {
        boolean valid = switch (target) {
            case IN_PROGRESS -> current == TicketStatus.OPEN;
            case RESOLVED -> current == TicketStatus.IN_PROGRESS;
            case CLOSED -> current == TicketStatus.RESOLVED;
            default -> false;
        };

        if (!valid) {
            throw new IllegalStateException(
                    String.format("Invalid status transition: %s → %s", current, target));
        }
    }

    /**
     * Map a Ticket document to a TicketDto.
     */
    private TicketDto mapToDto(Ticket ticket) {
        TicketDto dto = new TicketDto();
        dto.setId(ticket.getId());
        dto.setBookingId(ticket.getBookingId());
        dto.setFacilityId(ticket.getFacilityId());
        dto.setFacilityName(ticket.getFacilityName());
        dto.setLocation(ticket.getLocation());
        dto.setUserId(ticket.getUserId());
        dto.setUserName(ticket.getUserName());
        dto.setUserEmail(ticket.getUserEmail());
        dto.setCategory(ticket.getCategory());
        dto.setPriority(ticket.getPriority());
        dto.setDescription(ticket.getDescription());
        dto.setContactEmail(ticket.getContactEmail());
        dto.setContactPhone(ticket.getContactPhone());
        dto.setImageUrls(ticket.getImageUrls());
        dto.setStatus(ticket.getStatus());
        dto.setAssignedTechnicianId(ticket.getAssignedTechnicianId());
        dto.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
        dto.setAssignedBy(ticket.getAssignedBy());
        dto.setRejectionReason(ticket.getRejectionReason());
        dto.setResolutionNotes(ticket.getResolutionNotes());
        dto.setCommentCount((int) commentRepository.countByTicketId(ticket.getId()));
        dto.setCreatedAt(ticket.getCreatedAt());
        dto.setUpdatedAt(ticket.getUpdatedAt());
        return dto;
    }

    /**
     * Map a TicketComment document to a TicketCommentDto.
     */
    private TicketCommentDto mapCommentToDto(TicketComment comment) {
        TicketCommentDto dto = new TicketCommentDto();
        dto.setId(comment.getId());
        dto.setTicketId(comment.getTicketId());
        dto.setUserId(comment.getUserId());
        dto.setUserName(comment.getUserName());
        dto.setUserProfilePicture(comment.getUserProfilePicture());
        dto.setUserRole(comment.getUserRole());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        return dto;
    }
}
