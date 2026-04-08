import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';

/**
 * Custom hook to manage WebSocket connection and real-time notifications.
 * Uses @stomp/stompjs (modern) for better compatibility with Vite/ESM.
 */
export const useNotifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const clientRef = useRef(null);

    const fetchInitialData = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await notificationService.getNotifications();
            const unread = await notificationService.getUnreadCount();
            setNotifications(data || []);
            setUnreadCount(unread || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetchInitialData();

        // Initialize STOMP client
        const client = new Client({
            webSocketFactory: () => new SockJS('/ws'),
            debug: (str) => {
                // console.log(str); // Uncomment for debugging
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = (frame) => {
            console.log('WebSocket Connected');
            client.subscribe(`/topic/notifications/${user.id}`, (message) => {
                const newNotification = JSON.parse(message.body);
                
                // Add to list and update count
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show toast
                toast.success(newNotification.message, {
                    duration: 4000,
                    position: 'top-right',
                    icon: '🔔',
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155'
                    }
                });
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error', frame.headers['message']);
            console.error('Details', frame.body);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [user, fetchInitialData]);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsReadPut();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            const wasUnread = !notifications.find(n => n.id === id)?.read;
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchInitialData
    };
};
