import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, approveBooking, rejectBooking, deleteBooking } from '../services/bookingService';
import { getAllFacilities } from '../services/facilityService';
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
    PENDING: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400', label: 'Pending' },
    APPROVED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400', label: 'Approved' },
    REJECTED: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400', label: 'Rejected' },
    CANCELLED: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400', label: 'Cancelled' },
};

// ─── Main Page ───────────────────────────────────────────────────────

export default function ManageBookings({ standalone = false }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [facilityFilter, setFacilityFilter] = useState('');
    const [facilities, setFacilities] = useState([]);

    // Modal state for reject
    const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await getAllFacilities();
                setFacilities(res.data.data || []);
            } catch (err) {
                console.error('Failed to load facilities for filter', err);
            }
        };
        fetchFacilities();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = {};
            if (activeTab) params.status = activeTab;
            if (facilityFilter) params.facilityId = facilityFilter;
            const res = await getAllBookings(params);
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
    }, [activeTab, facilityFilter]);

    const handleApprove = async (bookingId) => {
        try {
            setActionLoading(bookingId);
            await approveBooking(bookingId, {});
            toast.success('Booking approved');
            fetchBookings();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to approve booking';
            toast.error(msg);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        try {
            setActionLoading(rejectModal.bookingId);
            await rejectBooking(rejectModal.bookingId, { remarks: rejectReason.trim() });
            toast.success('Booking rejected');
            setRejectModal({ open: false, bookingId: null });
            setRejectReason('');
            fetchBookings();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reject booking';
            toast.error(msg);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (bookingId) => {
        if (!confirm('Are you sure you want to permanently delete this booking?')) return;
        try {
            setActionLoading(bookingId);
            await deleteBooking(bookingId);
            toast.success('Booking deleted');
            fetchBookings();
        } catch (err) {
            toast.error('Failed to delete booking');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
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
        <div className={standalone ? "" : "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"}>
            {/* Background decoration */}
            {!standalone && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
                </div>
            )}

            <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${standalone ? "py-0" : "py-8"}`}>
                {/* Header */}
                {!standalone && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m12 19-7-7 7-7" />
                                    <path d="M19 12H5" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Manage Bookings</h1>
                                <p className="text-slate-400 mt-1">Review and manage all booking requests</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Status Tabs */}
                    <div className="flex gap-1 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1.5 overflow-x-auto flex-1">
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

                    {/* Facility Filter */}
                    <select
                        value={facilityFilter}
                        onChange={(e) => setFacilityFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none min-w-48"
                    >
                        <option value="">All Facilities</option>
                        {facilities.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-slate-500 text-sm mb-4">
                        {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
                    </p>
                )}

                {/* Bookings Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                        <p className="text-slate-400">No booking requests match your current filters</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="text-left px-5 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Resource</th>
                                        <th className="text-left px-5 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Booked By</th>
                                        <th className="text-left px-5 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Date & Time</th>
                                        <th className="text-left px-5 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Purpose</th>
                                        <th className="text-left px-5 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                                        <th className="text-right px-5 py-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {bookings.map(booking => {
                                        const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
                                        return (
                                            <tr key={booking.id} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="px-5 py-4">
                                                    <Link to={`/bookings/${booking.id}`} className="text-white font-medium text-sm hover:text-blue-400 transition-colors">
                                                        {booking.facilityName}
                                                    </Link>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-white text-sm">{booking.userName}</div>
                                                    <div className="text-slate-500 text-xs">{booking.userEmail}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-white text-sm">{formatDate(booking.bookingDate)}</div>
                                                    <div className="text-slate-500 text-xs">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-slate-300 text-sm max-w-48 truncate" title={booking.purpose}>{booking.purpose}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                                        {statusStyle.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {booking.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(booking.id)}
                                                                    disabled={actionLoading === booking.id}
                                                                    className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => { setRejectModal({ open: true, bookingId: booking.id }); setRejectReason(''); }}
                                                                    disabled={actionLoading === booking.id}
                                                                    className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <Link
                                                            to={`/bookings/${booking.id}`}
                                                            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(booking.id)}
                                                            disabled={actionLoading === booking.id}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                                                            title="Delete booking"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-semibold text-white mb-1">Reject Booking</h3>
                        <p className="text-slate-400 text-sm mb-4">Please provide a reason for rejecting this booking request.</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Enter rejection reason..."
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => { setRejectModal({ open: false, bookingId: null }); setRejectReason(''); }}
                                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? 'Rejecting...' : 'Reject Booking'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
