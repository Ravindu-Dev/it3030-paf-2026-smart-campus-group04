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
        <div className={standalone ? "" : "min-h-screen bg-slate-900 relative overflow-hidden pt-24 pb-4 sm:pt-28 sm:pb-10"}>
            {/* Background decoration */}
            {!standalone && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 animate-pulse"></div>
                    <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            )}

            <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${standalone ? "py-0" : "py-8 z-10"}`}>
                {/* Header */}
                {!standalone && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m12 19-7-7 7-7" />
                                    <path d="M19 12H5" />
                                </svg>
                            </Link>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                                    Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Bookings</span>
                                </h1>
                                <p className="text-slate-300 mt-2 text-lg">Review and manage all booking requests</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Status Tabs */}
                    <div className="flex gap-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-1.5 overflow-x-auto flex-1 shadow-lg">
                        {STATUS_TABS.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.value
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Facility Filter */}
                    <div className="relative">
                        <select
                            value={facilityFilter}
                            onChange={(e) => setFacilityFilter(e.target.value)}
                            className="w-full sm:w-auto px-5 py-3 h-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none min-w-[220px] shadow-lg [color-scheme:dark]"
                        >
                            <option value="" className="bg-slate-800">All Facilities</option>
                            {facilities.map(f => (
                                <option key={f.id} value={f.id} className="bg-slate-800">{f.name}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
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
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-slate-700/50 bg-slate-800/50">
                                        <th className="text-left px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-widest w-auto whitespace-nowrap">Resource</th>
                                        <th className="text-left px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-widest w-auto">Booked By</th>
                                        <th className="text-left px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-widest w-44 whitespace-nowrap">Date & Time</th>
                                        <th className="text-left px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-widest w-auto">Purpose</th>
                                        <th className="text-left px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-widest w-32 whitespace-nowrap">Status</th>
                                        <th className="text-right px-6 py-5 text-slate-400 text-xs font-bold uppercase tracking-widest w-40 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {bookings.map(booking => {
                                        const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
                                        return (
                                            <tr key={booking.id} className="hover:bg-slate-700/30 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <Link to={`/bookings/${booking.id}`} className="text-white font-semibold text-sm hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 transition-all">
                                                        {booking.facilityName}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-white text-sm font-medium">{booking.userName}</div>
                                                    <div className="text-slate-400 text-xs mt-0.5">{booking.userEmail}</div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="text-white text-sm">{formatDate(booking.bookingDate)}</div>
                                                    <div className="text-emerald-400 text-xs mt-0.5 font-medium">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-slate-300 text-sm max-w-[200px] truncate" title={booking.purpose}>{booking.purpose}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} shadow-sm`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${booking.status === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                                                        {statusStyle.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {booking.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(booking.id)}
                                                                    disabled={actionLoading === booking.id}
                                                                    className="px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/30 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => { setRejectModal({ open: true, bookingId: booking.id }); setRejectReason(''); }}
                                                                    disabled={actionLoading === booking.id}
                                                                    className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <Link
                                                            to={`/bookings/${booking.id}`}
                                                            className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 rounded-lg transition-all hover:text-white"
                                                        >
                                                            View
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(booking.id)}
                                                            disabled={actionLoading === booking.id}
                                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer disabled:opacity-50"
                                                            title="Delete booking"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all">
                        <div className="flex items-center gap-3 mb-4 text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            <h3 className="text-xl font-bold text-white">Reject Booking</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">Please provide a reason for rejecting this booking request. This will be sent to the user.</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            placeholder="Enter detailed rejection reason..."
                            className="w-full px-5 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none shadow-inner"
                            autoFocus
                        />
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => { setRejectModal({ open: false, bookingId: null }); setRejectReason(''); }}
                                className="flex-1 px-5 py-3 bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600/50 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/20 hover:shadow-red-500/40 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
