import api from "./api";

/**
 * Booking API service — all calls to the /bookings endpoints.
 */

/**
 * Create a new booking request.
 * @param {Object} data - { facilityId, bookingDate, startTime, endTime, purpose, expectedAttendees }
 */
export const createBooking = (data) => {
  return api.post("/bookings", data);
};

/**
 * Get the current user's bookings.
 * @param {Object} params - Optional query params: { status }
 */
export const getMyBookings = (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      cleanParams[key] = value;
    }
  });
  return api.get("/bookings/my", { params: cleanParams });
};

/**
 * Get all bookings (admin only).
 * @param {Object} params - Optional query params: { status, facilityId }
 */
export const getAllBookings = (params = {}) => {
  const cleanParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      cleanParams[key] = value;
    }
  });
  return api.get("/bookings", { params: cleanParams });
};

/**
 * Get a single booking by ID.
 */
export const getBookingById = (id) => {
  return api.get(`/bookings/${id}`);
};

/**
 * Approve a booking (admin only).
 * @param {string} id - Booking ID
 * @param {Object} data - Optional { remarks }
 */
export const approveBooking = (id, data = {}) => {
  return api.patch(`/bookings/${id}/approve`, data);
};

/**
 * Reject a booking (admin only).
 * @param {string} id - Booking ID
 * @param {Object} data - { remarks } (required)
 */
export const rejectBooking = (id, data) => {
  return api.patch(`/bookings/${id}/reject`, data);
};

/**
 * Cancel a booking (own booking).
 * @param {string} id - Booking ID
 */
export const cancelBooking = (id) => {
  return api.patch(`/bookings/${id}/cancel`);
};

/**
 * Delete a booking (admin only).
 * @param {string} id - Booking ID
 */
export const deleteBooking = (id) => {
  return api.delete(`/bookings/${id}`);
};
