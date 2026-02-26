import axios from 'axios';

/**
 * Pre-configured Axios instance for all API calls.
 *
 * Base URL points to the Spring Boot backend.
 * In development, Vite's proxy (see vite.config.js) forwards /api requests
 * to http://localhost:8082, so relative URLs work seamlessly.
 *
 * Usage:
 *   import api from '../services/api';
 *   const res = await api.get('/users');
 *   const res = await api.post('/auth/login', { email, password });
 */
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor ─────────────────────────────────────────────
// Attach the auth token to every outgoing request (when available).
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response Interceptor ────────────────────────────────────────────
// Handle common response errors globally.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                // Token expired or invalid — redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            }

            if (status === 403) {
                console.error('Access denied.');
            }
        }
        return Promise.reject(error);
    },
);

export default api;
