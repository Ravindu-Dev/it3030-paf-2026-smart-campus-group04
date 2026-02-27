import api from './api';

/**
 * Facility API service — all calls to the /facilities endpoints.
 */

/**
 * Get all facilities with optional filters.
 * @param {Object} params - Query parameters: type, status, location, minCapacity, search
 */
export const getAllFacilities = (params = {}) => {
    // Remove empty/null params
    const cleanParams = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            cleanParams[key] = value;
        }
    });
    return api.get('/facilities', { params: cleanParams });
};

/**
 * Get a single facility by ID.
 */
export const getFacilityById = (id) => {
    return api.get(`/facilities/${id}`);
};

/**
 * Create a new facility (admin only).
 */
export const createFacility = (data) => {
    return api.post('/facilities', data);
};

/**
 * Update an existing facility (admin only).
 */
export const updateFacility = (id, data) => {
    return api.put(`/facilities/${id}`, data);
};

/**
 * Delete a facility (admin only).
 */
export const deleteFacility = (id) => {
    return api.delete(`/facilities/${id}`);
};
