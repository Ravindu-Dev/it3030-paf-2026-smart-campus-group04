import api from './api';

/**
 * API Service for Transport Tracking (Module B).
 * Handles shuttles, routes, and driver tracking operations.
 */
const transportService = {
    // ─── Shuttles ──────────────────────────────────────────────────────
    /**
     * Fetch all shuttles.
     * @returns {Promise<Object>} The API response containing shuttles
     */
    getAllShuttles: async () => {
        const response = await api.get('/shuttles');
        return response.data;
    },
    /**
     * Fetch a specific shuttle by ID.
     * @param {string} id - The shuttle ID
     * @returns {Promise<Object>} The API response containing the shuttle
     */
    getShuttleById: async (id) => {
        const response = await api.get(`/shuttles/${id}`);
        return response.data;
    },
    createShuttle: async (data) => {
        const response = await api.post('/shuttles', data);
        return response.data;
    },
    updateShuttle: async (id, data) => {
        const response = await api.put(`/shuttles/${id}`, data);
        return response.data;
    },
    deleteShuttle: async (id) => {
        const response = await api.delete(`/shuttles/${id}`);
        return response.data;
    },
    getShuttleRatings: async (id) => {
        const response = await api.get(`/shuttles/${id}/ratings`);
        return response.data;
    },
    createShuttleRating: async (id, data) => {
        const response = await api.post(`/shuttles/${id}/ratings`, data);
        return response.data;
    },


    // ─── Routes ────────────────────────────────────────────────────────
    /**
     * Fetch all routes.
     * @returns {Promise<Object>} The API response containing all routes
     */
    getAllRoutes: async () => {
        const response = await api.get('/routes');
        return response.data;
    },
    createRoute: async (data) => {
        const response = await api.post('/routes', data);
        return response.data;
    },
    updateRoute: async (id, data) => {
        const response = await api.put(`/routes/${id}`, data);
        return response.data;
    },
    deleteRoute: async (id) => {
        const response = await api.delete(`/routes/${id}`);
        return response.data;
    },

    // ─── Driver Tracking (Public) ──────────────────────────────────────
    /**
     * Retrieve a shuttle using its public tracking token.
     * @param {string} token - The public tracking token
     * @returns {Promise<Object>} The API response containing the shuttle
     */
    getShuttleByToken: async (token) => {
        const response = await api.get(`/shuttles/track/${token}`);
        return response.data;
    },
    updateLocation: async (token, data) => {
        const response = await api.patch(`/shuttles/track/${token}`, data);
        return response.data;
    },
    stopTracking: async (token) => {
        const response = await api.patch(`/shuttles/track/${token}/stop`);
        return response.data;
    },
};

export default transportService;
