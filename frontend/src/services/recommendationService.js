import api from './api';

/**
 * Fetches AI-powered smart recommendations for the authenticated user.
 * @returns {Promise} Resolves to the recommendation data array.
 */
export const getRecommendations = () => {
    return api.get('/recommendations');
};
