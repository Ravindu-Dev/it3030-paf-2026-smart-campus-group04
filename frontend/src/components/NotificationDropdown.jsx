/**
 * Helper to format date string to "time ago"
 */
const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
};
export default function NotificationDropdown({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    loading,
    notificationsEnabled,
    onToggleNotifications
}) {
    return (
        <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleNotifications();
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notificationsEnabled ? 'bg-amber-500' : 'bg-slate-700'
                            }`}
                        role="switch"
                        aria-checked={notificationsEnabled}
                        title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
                {notificationsEnabled && notifications.some(n => !n.read) && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-tight cursor-pointer"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-slate-400 text-sm">Loading...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-slate-800/50">
                        {notifications.map((notification) => {
                            const priorityClasses = {
                                'HIGH': 'border-l-red-500 bg-red-500/5',
                                'MEDIUM': 'border-l-amber-500 bg-amber-500/5',
                                'LOW': 'border-l-emerald-500 bg-emerald-500/5'
                            };
                            const priorityAccent = priorityClasses[notification.priority] || (notification.read ? 'border-l-transparent' : 'border-l-blue-500 bg-blue-500/5');

                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 transition-all hover:bg-slate-800/40 relative group border-l-2 ${priorityAccent}`}
                                >
                                    <div className="flex gap-3">
                                        {/* Icon based on type */}
                                        <div className="shrink-0 mt-1">
                                            <NotificationIcon type={notification.type} isRead={notification.read} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                                                    notification.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                                    notification.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    {notification.priority}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {notification.category}
                                                </span>
                                            </div>
                                            <p className={`text-sm leading-relaxed mb-1 ${!notification.read ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {formatTimeAgo(notification.createdAt)}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => onMarkAsRead(notification.id)}
                                                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                                                    title="Mark as read"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDelete(notification.id)}
                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                                                title="Delete"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-10 text-center">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No notifications available.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/50 text-center">
                    <span className="text-[10px] text-slate-500 italic">Stay updated with your campus activities</span>
                </div>
            )}
        </div>
    );
}

function NotificationIcon({ type, isRead }) {
    const colorClass = isRead ? 'text-slate-500 bg-slate-800' : 'text-blue-400 bg-blue-500/10';

    switch (type) {
        case 'BOOKING_APPROVED':
            return (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRead ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            );
        case 'BOOKING_REJECTED':
            return (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRead ? 'bg-slate-800 text-slate-500' : 'bg-red-500/10 text-red-400'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            );
        case 'TICKET_STATUS_UPDATED':
            return (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
            );
        case 'NEW_COMMENT':
            return (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                </div>
            );
        default:
            return (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
            );
    }
}
