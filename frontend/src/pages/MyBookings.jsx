import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import toast from 'react-hot-toast';

// ─── Status configuration ────────────────────────────────────────────

const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLES = {
    PENDING: {
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
        label: 'Pending',
    },
    APPROVED: {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        label: 'Approved',
    },
    REJECTED: {
        bg: 'bg-red-500/15',
        text: 'text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-400',
        label: 'Rejected',
    },
    CANCELLED: {
        bg: 'bg-slate-500/15',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
        label: 'Cancelled',
    },
};

// ─── Main Page ───────────────────────────────────────────────────────

export default function MyBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = {};
            if (activeTab) params.status = activeTab;

            const res = await getMyBookings(params);
            setBookings(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            setCancellingId(bookingId);
            await cancelBooking(bookingId);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to cancel booking';
            toast.error(msg);
        } finally {
            setCancellingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${m} ${ampm}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            My Bookings
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Track and manage your resource booking requests
                        </p>
                    </div>
                    <Link
                        to="/bookings/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14" />
                            <path d="M5 12h14" />
                        </svg>
                        New Booking
                    </Link>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-1 mb-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1.5 overflow-x-auto">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                                activeTab === tab.value
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-slate-500 text-sm mb-4">
                        {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
                    </p>
                )}

                {/* Bookings List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                        <p className="text-slate-400 mb-6">
                            {activeTab ? 'No bookings with this status' : "You haven't made any bookings yet"}
                        </p>
                        <Link
                            to="/bookings/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
                        >
                            Book a Resource →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onCancel={handleCancel}
                                cancellingId={cancellingId}
                                formatDate={formatDate}
                                formatTime={formatTime}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Booking Card ────────────────────────────────────────────────────

function BookingCard({ booking, onCancel, cancellingId, formatDate, formatTime }) {
    const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
    const canCancel = booking.status === 'APPROVED' || booking.status === 'PENDING';

    return (
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Main Info */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div>
                            <Link
                                to={`/bookings/${booking.id}`}
                                className="text-white font-semibold text-lg hover:text-blue-400 transition-colors"
                            >
                                {booking.facilityName}
                            </Link>
                            <p className="text-slate-400 text-sm mt-0.5">{booking.purpose}</p>
                        </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pl-13">
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {formatDate(booking.bookingDate)}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                        </div>
                        {booking.expectedAttendees && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {booking.expectedAttendees} attendees
                            </div>
                        )}
                    </div>

                    {/* Admin Remarks */}
                    {booking.adminRemarks && (
                        <div className="pl-13 mt-2">
                            <div className={`inline-flex items-start gap-2 px-3 py-2 rounded-lg ${
                                booking.status === 'REJECTED' ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-700/30 border border-slate-600/30'
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mt-0.5 flex-shrink-0 ${booking.status === 'REJECTED' ? 'text-red-400' : 'text-slate-400'}`}>
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className={`text-sm ${booking.status === 'REJECTED' ? 'text-red-300' : 'text-slate-300'}`}>
                                    {booking.adminRemarks}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Status + Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                        {statusStyle.label}
                    </span>

                    <div className="flex gap-2">
                        <Link
                            to={`/bookings/${booking.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors"
                        >
                            View
                        </Link>
                        {canCancel && (
                            <button
                                onClick={() => onCancel(booking.id)}
                                disabled={cancellingId === booking.id}
                                className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
