import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import chatbotService from '../services/chatbotService';
import './ChatBot.css';

/**
 * Floating AI Chatbot widget.
 *
 * Features:
 * - Bottom-right FAB with animated pulse
 * - Expandable glassmorphism chat panel
 * - Message bubbles with avatars
 * - Typing indicator while awaiting AI response
 * - Quick suggestion chips
 * - Auto-scroll to latest message
 * - Only visible when user is logged in
 */
const SUGGESTIONS = [
    '🏫 Show all facilities',
    '🔬 Available labs',
    '📅 My bookings',
    '🎓 Lecture halls',
    '🔧 Open tickets',
    '❓ How to book a room?',
];

const WELCOME_MESSAGE = {
    role: 'bot',
    text: "Hi there! 👋 I'm the **Smart Campus Assistant**. I can help you with:\n\n• 🏫 Facility information (labs, halls, rooms)\n• 📅 Booking details & availability\n• 🔧 Maintenance tickets\n\nAsk me anything about the campus!",
};

export default function ChatBot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Don't render if not logged in (must be after all hooks)
    if (!user) return null;

    const sendMessage = async (text) => {
        const trimmed = (text || input).trim();
        if (!trimmed || isLoading) return;

        // Add user message
        const userMsg = { role: 'user', text: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await chatbotService.sendMessage(trimmed);
            const botMsg = { role: 'bot', text: data.reply };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error('Chatbot error:', err);
            const errorMsg = {
                role: 'bot',
                text: "I'm sorry, I encountered an error. Please try again in a moment. 🔧",
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleChipClick = (suggestion) => {
        sendMessage(suggestion);
    };

    /**
     * Render markdown-lite text (bold, bullet points).
     */
    const renderText = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <>
            {/* ─── FAB Button ────────────────────────────────────── */}
            <button
                className={`chatbot-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title={isOpen ? 'Close chat' : 'Smart Campus Assistant'}
                id="chatbot-fab"
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zm-9-4h2v2h-2zm0-6h2v4h-2z" />
                    </svg>
                )}
            </button>

            {/* ─── Chat Panel ────────────────────────────────────── */}
            <div className={`chatbot-panel ${isOpen ? 'visible' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-avatar">🤖</div>
                    <div className="chatbot-header-info">
                        <h3>Smart Campus Assistant</h3>
                        <p>
                            <span className="chatbot-status-dot"></span>
                            Powered by AI · Always online
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chatbot-message ${msg.role}`}>
                            <div className="chatbot-message-avatar">
                                {msg.role === 'bot' ? '🤖' : '👤'}
                            </div>
                            <div
                                className="chatbot-message-bubble"
                                dangerouslySetInnerHTML={{
                                    __html: renderText(msg.text),
                                }}
                            />
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="chatbot-typing">
                            <div className="chatbot-message-avatar" style={{
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                width: 28, height: 28, borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14
                            }}>🤖</div>
                            <div className="chatbot-typing-bubble">
                                <span className="chatbot-typing-dot"></span>
                                <span className="chatbot-typing-dot"></span>
                                <span className="chatbot-typing-dot"></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestion chips — show only at start or after few messages */}
                {messages.length <= 3 && !isLoading && (
                    <div className="chatbot-suggestions">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                className="chatbot-chip"
                                onClick={() => handleChipClick(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="chatbot-input-area">
                    <div className="chatbot-input-wrapper">
                        <textarea
                            ref={inputRef}
                            className="chatbot-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about facilities, bookings, tickets..."
                            rows={1}
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading}
                            title="Send message"
                        >
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
