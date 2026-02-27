import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookingById, approveBooking, rejectBooking, cancelBooking } from '../services/bookingService';
import toast from 'react-hot-toast';

// ─── Status configuration ────────────────────────────────────────────

const STATUS_STYLES = {
    PENDING: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400', label: 'Pending Review' },
    APPROVED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400', label: 'Approved' },
    REJECTED: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400', label: 'Rejected' },
    CANCELLED: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400', label: 'Cancelled' },
};

const WORKFLOW_STEPS = [
    { key: 'PENDING', label: 'Submitted', icon: '📝' },
    { key: 'REVIEWED', label: 'Reviewed', icon: '👀' },
    { key: 'FINAL', label: 'Final', icon: '✅' },
];

// ─── Main Page ───────────────────────────────────────────────────────

export default function BookingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Reject modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const res = await getBookingById(id);
            setBooking(res.data.data);
        } catch (err) {
            toast.error('Failed to load booking details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            await approveBooking(id, {});
            toast.success('Booking approved');
            fetchBooking();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        try {
            setActionLoading(true);
            await rejectBooking(id, { remarks: rejectReason.trim() });
            toast.success('Booking rejected');
            setShowRejectModal(false);
            setRejectReason('');
            fetchBooking();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            setActionLoading(true);
            await cancelBooking(id);
            toast.success('Booking cancelled');
            fetchBooking();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
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

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '';
        return new Date(dateTimeStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Booking not found</h3>
                    <Link to="/bookings" className="text-blue-400 hover:text-blue-300 text-sm">← Back to My Bookings</Link>
                </div>
            </div>
        );
    }

    const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
    const isOwner = booking.userId === user?.id;
    const isAdmin = user?.role === 'ADMIN';
    const canApproveReject = isAdmin && booking.status === 'PENDING';
    const canCancel = isOwner && (booking.status === 'APPROVED' || booking.status === 'PENDING');

    // Workflow progress
    const getStepStatus = (step) => {
        if (step === 'PENDING') return 'complete';
        if (step === 'REVIEWED') {
            if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(booking.status)) return 'complete';
            if (booking.status === 'PENDING') return 'current';
        }
        if (step === 'FINAL') {
            if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(booking.status)) return 'complete';
        }
        return 'pending';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-6 cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 19-7-7 7-7" />
                        <path d="M19 12H5" />
                    </svg>
                    Back
                </button>

                {/* Header Card */}
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-white">{booking.facilityName}</h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                                    {statusStyle.label}
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Booking ID: <span className="text-slate-300 font-mono">{booking.id}</span>
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {canApproveReject && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => { setShowRejectModal(true); setRejectReason(''); }}
                                        disabled={actionLoading}
                                        className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {canCancel && (
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Workflow Timeline */}
                    <div className="flex items-center gap-0 mt-6 px-4">
                        {WORKFLOW_STEPS.map((step, index) => {
                            const status = getStepStatus(step.key);
                            return (
                                <div key={step.key} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                            status === 'complete' ? 'bg-blue-500/20 border-2 border-blue-500' :
                                            status === 'current' ? 'bg-amber-500/20 border-2 border-amber-500 animate-pulse' :
                                            'bg-slate-700/50 border-2 border-slate-600'
                                        }`}>
                                            {step.icon}
                                        </div>
                                        <span className={`text-xs mt-2 font-medium ${
                                            status === 'complete' ? 'text-blue-400' :
                                            status === 'current' ? 'text-amber-400' :
                                            'text-slate-500'
                                        }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < WORKFLOW_STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-3 rounded ${
                                            status === 'complete' ? 'bg-blue-500/50' : 'bg-slate-700'
                                        }`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Booking Details */}
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Booking Details
                        </h2>
                        <div className="space-y-4">
                            <DetailRow label="Date" value={formatDate(booking.bookingDate)} />
                            <DetailRow label="Time" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
                            <DetailRow label="Purpose" value={booking.purpose} />
                            {booking.expectedAttendees && (
                                <DetailRow label="Expected Attendees" value={booking.expectedAttendees} />
                            )}
                            <DetailRow label="Submitted" value={formatDateTime(booking.createdAt)} />
                        </div>
                    </div>

                    {/* Requester Info */}
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Requester
                        </h2>
                        <div className="space-y-4">
                            <DetailRow label="Name" value={booking.userName} />
                            <DetailRow label="Email" value={booking.userEmail} />
                            <DetailRow label="Resource" value={booking.facilityName} />
                            <div className="pt-2">
                                <Link
                                    to={`/facilities/${booking.facilityId}`}
                                    className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                                >
                                    View Facility
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Review Info (if reviewed) */}
                    {(booking.reviewedBy || booking.adminRemarks) && (
                        <div className="md:col-span-2 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                Admin Review
                            </h2>
                            <div className="space-y-4">
                                {booking.reviewedAt && (
                                    <DetailRow label="Reviewed At" value={formatDateTime(booking.reviewedAt)} />
                                )}
                                {booking.adminRemarks && (
                                    <div>
                                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Remarks</p>
                                        <div className={`p-3 rounded-xl text-sm ${
                                            booking.status === 'REJECTED'
                                                ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                                                : 'bg-slate-700/30 border border-slate-600/30 text-slate-300'
                                        }`}>
                                            {booking.adminRemarks}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
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
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
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

// ─── Detail Row Component ────────────────────────────────────────────

function DetailRow({ label, value }) {
    return (
        <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-white text-sm">{value}</p>
        </div>
    );
}
