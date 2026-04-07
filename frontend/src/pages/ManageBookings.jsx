import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllBookings, approveBooking, rejectBooking, deleteBooking } from '../services/bookingService';
import { getAllFacilities } from '../services/facilityService';
import toast from 'react-hot-toast';

// ─── Status configuration ────────────────────────────────────────────

const STATUS_TABS = [
    { value: '', label: 'All Bookings', icon: '📋' },
    { value: 'PENDING', label: 'Pending', icon: '⏳' },
    { value: 'APPROVED', label: 'Approved', icon: '✅' },
    { value: 'REJECTED', label: 'Rejected', icon: '❌' },
    { value: 'CANCELLED', label: 'Cancelled', icon: '🚫' },
];

const STATUS_STYLES = {
    PENDING: { 
        bg: 'bg-amber-500/10', 
        text: 'text-amber-400', 
        border: 'border-amber-500/20', 
        dot: 'bg-amber-400', 
        label: 'Pending Approval' 
    },
    APPROVED: { 
        bg: 'bg-emerald-500/10', 
        text: 'text-emerald-400', 
        border: 'border-emerald-500/20', 
        dot: 'bg-emerald-400', 
        label: 'Approved' 
    },
    REJECTED: { 
        bg: 'bg-red-500/10', 
        text: 'text-red-400', 
        border: 'border-red-500/20', 
        dot: 'bg-red-400', 
        label: 'Rejected' 
    },
    CANCELLED: { 
        bg: 'bg-slate-500/10', 
        text: 'text-slate-400', 
        border: 'border-slate-500/20', 
        dot: 'bg-slate-400', 
        label: 'Cancelled' 
    },
};

export default function ManageBookings({ standalone = false }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [facilityFilter, setFacilityFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [facilities, setFacilities] = useState([]);

    // Modal state for reject
    const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [visibleCount, setVisibleCount] = useState(6);

    const fetchFacilities = async () => {
        try {
            const res = await getAllFacilities();
            setFacilities(res.data.data || []);
        } catch (err) {
            console.error('Failed to load facilities', err);
        }
    };

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (activeTab) params.status = activeTab;
            if (facilityFilter) params.facilityId = facilityFilter;
            const res = await getAllBookings(params);
            
            let data = res.data.data || [];
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                data = data.filter(b => 
                    b.userName?.toLowerCase().includes(query) || 
                    b.facilityName?.toLowerCase().includes(query) ||
                    b.purpose?.toLowerCase().includes(query)
                );
            }
            setBookings(data);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, [activeTab, facilityFilter, searchQuery]);

    useEffect(() => {
        fetchFacilities();
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(6);
    }, [activeTab, facilityFilter, searchQuery]);

    const handleApprove = async (bookingId) => {
        try {
            setActionLoading(bookingId);
            await approveBooking(bookingId, {});
            toast.success('Booking approved successfully');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason');
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
            toast.error(err.response?.data?.message || 'Failed to reject booking');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (bookingId) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">Permanently delete this booking?</span>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                setActionLoading(bookingId);
                                await deleteBooking(bookingId);
                                toast.success('Booking deleted');
                                fetchBookings();
                            } catch (err) {
                                toast.error('Failed to delete');
                            } finally {
                                setActionLoading(null);
                            }
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-md shadow-lg"
                    >
                        Delete
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 bg-slate-200 text-slate-800 text-xs rounded-md">
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
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
        <div className={standalone ? "" : "min-h-screen bg-slate-950 p-4 sm:p-8"}>
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* ─── Header Section ─────────────────────────────────── */}
                {!standalone && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                                <span className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </span>
                                Manage <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">Bookings</span>
                            </h1>
                            <p className="text-slate-400 text-lg">Central hub for tracking and approving campus resources</p>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="flex gap-4">
                            <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Pending</p>
                                <p className="text-xl font-bold text-amber-400">{bookings.filter(b => b.status === 'PENDING').length}</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Total</p>
                                <p className="text-xl font-bold text-white">{bookings.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Control Bar (Search & Filter) ──────────────────── */}
                <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Search Input */}
                        <div className="lg:col-span-5 relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by user, facility or purpose..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all shadow-inner"
                            />
                        </div>

                        {/* Status Dropdown */}
                        <div className="lg:col-span-4 relative">
                            <select
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="w-full px-5 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none shadow-inner scheme-dark outline-none"
                            >
                                {STATUS_TABS.map(tab => (
                                    <option key={tab.value} value={tab.value}>
                                        {tab.icon} {tab.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        {/* Facility Picker */}
                        <div className="lg:col-span-3 relative">
                            <select
                                value={facilityFilter}
                                onChange={(e) => setFacilityFilter(e.target.value)}
                                className="w-full px-5 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none shadow-inner scheme-dark outline-none"
                            >
                                <option value="">All Facilities</option>
                                {facilities.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Bookings List ──────────────────────────────────── */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-lg"></div>
                            <p className="text-slate-400 font-medium animate-pulse">Loading bookings...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-24 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 mx-auto mb-6 bg-slate-800/50 rounded-full flex items-center justify-center text-4xl shadow-xl">🙊</div>
                            <h3 className="text-2xl font-bold text-white mb-2">No bookings match</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                            <button 
                                onClick={() => { setActiveTab(''); setFacilityFilter(''); setSearchQuery(''); }}
                                className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all border border-slate-700 cursor-pointer"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 gap-4">
                                {bookings.slice(0, visibleCount).map((booking, idx) => {
                                const st = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
                                return (
                                    <div 
                                        key={booking.id} 
                                        className="group relative bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/30 rounded-3xl p-5 sm:px-8 sm:py-6 transition-all duration-300 shadow-lg hover:shadow-blue-500/5"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                            {/* Resource & User */}
                                            <div className="lg:w-1/4 space-y-3">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Resource</p>
                                                    <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors truncate">
                                                        {booking.facilityName}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-3 p-2 bg-slate-950/40 rounded-2xl border border-slate-800/50 transition-all">
                                                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-700 to-slate-800 border border-slate-600/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {booking.userName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-200 truncate">{booking.userName}</p>
                                                        <p className="text-[11px] text-slate-500 truncate">{booking.userEmail}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timing */}
                                            <div className="lg:w-1/4 space-y-3">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Date & Time</p>
                                                    <p className="text-white font-medium text-sm">{formatDate(booking.bookingDate)}</p>
                                                </div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                    <span className="text-emerald-400 text-xs font-bold font-mono">
                                                        {formatTime(booking.startTime)} — {formatTime(booking.endTime)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Purpose */}
                                            <div className="lg:flex-1">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Purpose</p>
                                                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 italic" title={booking.purpose}>
                                                        "{booking.purpose || 'No purpose provided'}"
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status & Actions */}
                                            <div className="lg:w-1/4 flex flex-col items-start lg:items-end gap-5">
                                                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-sm transition-all ${st.bg} ${st.text} ${st.border}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${booking.status === 'PENDING' ? 'animate-pulse' : ''}`} />
                                                    {st.label}
                                                </span>

                                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(booking.id)}
                                                                disabled={actionLoading === booking.id}
                                                                className="flex-1 lg:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => setRejectModal({ open: true, bookingId: booking.id })}
                                                                disabled={actionLoading === booking.id}
                                                                className="flex-1 lg:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-400 rounded-xl text-[11px] font-bold transition-all border border-slate-700 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
                                                        <Link 
                                                            to={`/bookings/${booking.id}`}
                                                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-700"
                                                            title="View details"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(booking.id)}
                                                            className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/10 cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>

                            {/* ─── See More / See Less (Refined Professional Style) ── */}
                            {bookings.length > 6 && (
                                <div className="relative pt-12 pb-8">
                                    {/* Subtle Gradient Fade when more are available */}
                                    {visibleCount < bookings.length && (
                                        <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-t from-slate-950/80 to-transparent pointer-events-none -translate-y-full" />
                                    )}
                                    
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-xl shadow-2xl">
                                            {visibleCount < bookings.length ? (
                                                <button 
                                                    onClick={() => setVisibleCount(prev => Math.min(prev + 6, bookings.length))}
                                                    className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                                >
                                                    <span>View More Bookings</span>
                                                    <svg className="w-4 h-4 text-emerald-500 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setVisibleCount(6)}
                                                    className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                                >
                                                    <span>Collapse List</span>
                                                    <svg className="w-4 h-4 text-emerald-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            
                                            <div className="h-4 w-px bg-slate-800 mx-1" />
                                            
                                            <div className="px-4 py-1 flex items-center gap-2 font-mono">
                                                <span className="text-white text-xs font-bold">{Math.min(visibleCount, bookings.length)}</span>
                                                <span className="text-slate-600 text-[10px] font-black uppercase tracking-tighter">/</span>
                                                <span className="text-slate-500 text-xs font-medium">{bookings.length}</span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">End of filtered results</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Reject Modal ─────────────────────────────────────── */}
            {rejectModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setRejectModal({ open: false, bookingId: null })} />
                    <div className="relative bg-slate-900 border border-slate-800/80 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center gap-4 text-red-500">
                            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Reject Request</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Please provide a brief explanation for the rejection. This reasoning will be visible to the user.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            placeholder="e.g. Schedule conflict with a major campus event..."
                            className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none transition-all"
                            autoFocus
                        />
                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setRejectModal({ open: false, bookingId: null })}
                                className="flex-1 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-bold transition-all border border-slate-700 cursor-pointer"
                            >
                                Nevermind
                            </button>
                            <button 
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || actionLoading}
                                className="flex-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-m font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
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
