import api from './api';

/**
 * Service for interacting with the Smart Campus AI Chatbot.
 */
const chatbotService = {
    /**
     * Send a message to the chatbot and get an AI response.
     * @param {string} message - The user's message
     * @returns {Promise<{reply: string, timestamp: string}>}
     */
    sendMessage: async (message) => {
        const response = await api.post('/chatbot/chat', { message });
        return response.data.data;
    },
};

export default chatbotService;
