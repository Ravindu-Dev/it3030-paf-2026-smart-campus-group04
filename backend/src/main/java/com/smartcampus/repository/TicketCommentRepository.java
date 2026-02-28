package com.smartcampus.repository;

import com.smartcampus.model.TicketComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * MongoDB repository for TicketComment documents.
 */
public interface TicketCommentRepository extends MongoRepository<TicketComment, String> {

    /** Find all comments for a ticket, ordered chronologically. */
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    /** Count comments for a ticket. */
    long countByTicketId(String ticketId);

    /** Delete all comments for a ticket (used when deleting a ticket). */
    void deleteByTicketId(String ticketId);
}
