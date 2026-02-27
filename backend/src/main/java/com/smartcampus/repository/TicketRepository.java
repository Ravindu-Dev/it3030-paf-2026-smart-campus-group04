package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

/**
 * MongoDB repository for Ticket documents.
 */
public interface TicketRepository extends MongoRepository<Ticket, String> {

    /** Find all tickets created by a specific user. */
    List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);

    /** Find all tickets assigned to a specific technician. */
    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(String technicianId);

    /** Find tickets by status. */
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    /** Find tickets by priority. */
    List<Ticket> findByPriorityOrderByCreatedAtDesc(TicketPriority priority);

    /** Find tickets by status and priority. */
    List<Ticket> findByStatusAndPriorityOrderByCreatedAtDesc(TicketStatus status, TicketPriority priority);

    /** Find tickets by facility. */
    List<Ticket> findByFacilityIdOrderByCreatedAtDesc(String facilityId);

    /** Find all tickets ordered by creation date descending. */
    List<Ticket> findAllByOrderByCreatedAtDesc();
}
