import api from './api';

/**
 * Service for Event-related API calls.
 */
export const getEvents = (includePast = false) => api.get(`/events?includePast=${includePast}`);
export const getEventById = (id) => api.get(`/events/${id}`);
export const registerForEvent = (id) => api.post(`/events/${id}/register`);
export const cancelRegistration = (id) => api.delete(`/events/${id}/cancel`);
export const getMyEvents = () => api.get('/events/my-events');
export const getMyEventsCount = () => api.get('/events/my-count');

// Admin Functions
export const getAllEventsAdmin = () => api.get('/events/admin');
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
