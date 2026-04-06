import api from './api';

const transportService = {
    // ─── Shuttles ──────────────────────────────────────────────────────
    getAllShuttles: async () => {
        const response = await api.get('/shuttles');
        return response.data;
    },
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

    // ─── Routes ────────────────────────────────────────────────────────
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
