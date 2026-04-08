import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import notificationService from '../services/notificationService';
import NotificationDropdown from './NotificationDropdown';
import { toast } from 'react-hot-toast';

export default function NotificationBell() {
    const { 
        notifications, 
        unreadCount, 
        loading, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification 
    } = useNotifications();
    
    const [isOpen, setIsOpen] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const bellRef = useRef(null);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSettings = async () => {
        try {
            const enabled = await notificationService.getNotificationSettings();
            setNotificationsEnabled(enabled);
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleToggleNotifications = async () => {
        const newState = !notificationsEnabled;
        try {
            await notificationService.updateNotificationSettings(newState);
            setNotificationsEnabled(newState);
            toast.success(`Notifications turned ${newState ? 'ON' : 'OFF'}`);
        } catch (error) {
            toast.error('Failed to update notification settings');
        }
    };

    return (
        <div className="relative" ref={bellRef}>
            <button
                onClick={toggleDropdown}
                className={`relative p-2.5 rounded-xl transition-all group ${isOpen
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5'
                    : notificationsEnabled
                        ? 'text-amber-400/80 hover:text-amber-400 hover:bg-slate-800/60 border border-transparent'
                        : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/60 border border-transparent'
                    }`}
                aria-label="Notifications"
            >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-amber-600 text-[9px] font-bold text-white shadow-sm">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onDelete={deleteNotification}
                    loading={loading}
                    notificationsEnabled={notificationsEnabled}
                    onToggleNotifications={handleToggleNotifications}
                />
            )}
        </div>
    );
}
