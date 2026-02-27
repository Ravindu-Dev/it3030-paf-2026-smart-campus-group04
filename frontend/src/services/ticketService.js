import api from "./api";

/**
 * Ticket API service — all calls to the /tickets endpoints.
 */

// ─── Ticket CRUD ──────────────────────────────────────────────────

/**
 * Create a new maintenance/incident ticket.
 * @param {Object} data - { bookingId, category, priority, description, contactEmail, contactPhone, imageUrls }
 */
export const createTicket = (data) => {
  return api.post("/tickets", data);
};

/**
 * Get the current user's tickets.
 */
export const getMyTickets = () => {
  return api.get("/tickets/my");
};

/**
 * Get all tickets (admin/manager).
 * @param {Object} params - Optional: { status, priority }
 */
export const getAllTickets = (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      cleanParams[key] = value;
    }
  });
  return api.get("/tickets", { params: cleanParams });
};

/**
 * Get a single ticket by ID.
 */
export const getTicketById = (id) => {
  return api.get(`/tickets/${id}`);
};

/**
 * Get tickets assigned to the current technician.
 */
export const getTechnicianTickets = () => {
  return api.get("/tickets/technician");
};

/**
 * Assign a technician to a ticket.
 * @param {string} ticketId
 * @param {Object} data - { technicianId }
 */
export const assignTechnician = (ticketId, data) => {
  return api.patch(`/tickets/${ticketId}/assign`, data);
};

/**
 * Update ticket status.
 * @param {string} ticketId
 * @param {string} newStatus - OPEN, IN_PROGRESS, RESOLVED, CLOSED
 * @param {Object} data - Optional { remarks }
 */
export const updateTicketStatus = (ticketId, newStatus, data = {}) => {
  return api.patch(`/tickets/${ticketId}/status?newStatus=${newStatus}`, data);
};

/**
 * Reject a ticket (admin only).
 * @param {string} ticketId
 * @param {Object} data - { remarks } (required rejection reason)
 */
export const rejectTicket = (ticketId, data) => {
  return api.patch(`/tickets/${ticketId}/reject`, data);
};

/**
 * Delete a ticket (admin only).
 */
export const deleteTicket = (ticketId) => {
  return api.delete(`/tickets/${ticketId}`);
};

// ─── Comments ─────────────────────────────────────────────────────

/**
 * Add a comment to a ticket.
 * @param {string} ticketId
 * @param {Object} data - { content }
 */
export const addComment = (ticketId, data) => {
  return api.post(`/tickets/${ticketId}/comments`, data);
};

/**
 * Get all comments for a ticket.
 */
export const getComments = (ticketId) => {
  return api.get(`/tickets/${ticketId}/comments`);
};

/**
 * Update a comment (owner only).
 */
export const updateComment = (ticketId, commentId, data) => {
  return api.put(`/tickets/${ticketId}/comments/${commentId}`, data);
};

/**
 * Delete a comment (owner or admin).
 */
export const deleteComment = (ticketId, commentId) => {
  return api.delete(`/tickets/${ticketId}/comments/${commentId}`);
};

// ─── Technicians ──────────────────────────────────────────────────

/**
 * Get all technician users (for assignment dropdown).
 */
export const getTechnicians = () => {
  return api.get("/users/technicians");
};
