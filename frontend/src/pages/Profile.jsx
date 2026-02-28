import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ── Tiny helper ─────────────────────────────────────────────────────── */
function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
}

function roleBadgeColor(role) {
    const map = {
        ADMIN: 'from-red-500 to-rose-600',
        MANAGER: 'from-purple-500 to-violet-600',
        TECHNICIAN: 'from-amber-500 to-orange-600',
        USER: 'from-blue-500 to-blue-600',
    };
    return map[role] || 'from-slate-500 to-slate-600';
}

function statusBadge(status) {
    const map = {
        APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
        CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        IN_PROGRESS: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };
    return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';
}

/**
 * Premium User Profile Page.
 * Left sidebar: avatar, name, quick stats, edit button, logout.
 * Right main: profile completion bar, tabbed sections.
 */
export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /* ── Form state ─────────────────── */
    const [name, setName] = useState(user?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    /* ── Bookings / Tickets data ────── */
    const [bookings, setBookings] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    /* ── Profile completion ─────────── */
    // Based on: name, email, phoneNumber, profilePicture
    const completionFields = [
        { filled: !!user?.name, label: 'Display Name' },
        { filled: !!user?.email, label: 'Email Address' },
        { filled: !!user?.phoneNumber || !!phoneNumber, label: 'Phone Number' },
        { filled: !!user?.profilePicture, label: 'Profile Picture' },
    ];
    const filledCount = completionFields.filter(f => f.filled).length;
    const completionScore = Math.round((filledCount / completionFields.length) * 100);
    const missingFields = completionFields.filter(f => !f.filled).map(f => f.label);

    /* ── Fetch bookings ─────────────── */
    const fetchBookings = useCallback(async () => {
        setBookingsLoading(true);
        try {
            const res = await api.get('/bookings/my');
            setBookings(res.data.data || []);
        } catch {
            setBookings([]);
        } finally {
            setBookingsLoading(false);
        }
    }, []);

    /* ── Fetch tickets ──────────────── */
    const fetchTickets = useCallback(async () => {
        setTicketsLoading(true);
        try {
            const res = await api.get('/tickets/my');
            setTickets(res.data.data || []);
        } catch {
            setTickets([]);
        } finally {
            setTicketsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
        fetchTickets();
    }, [fetchBookings, fetchTickets]);

    /* ── Handlers ───────────────────── */
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Name cannot be empty.'); return; }

        const trimmedPhone = phoneNumber.trim();
        if (trimmedPhone && !/^[0-9]{10}$/.test(trimmedPhone)) {
            toast.error('Phone number must be exactly 10 digits.'); return;
        }

        setIsUpdating(true);
        try {
            await api.put('/auth/profile', {
                name: name.trim(),
                phoneNumber: trimmedPhone || null,
            });
            toast.success('Profile updated successfully!');
            window.location.reload();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete('/auth/account');
            toast.success('Account deleted successfully.');
            logout();
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete account.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    /* ── Tabs config ────────────────── */
    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'bookings', label: `My Bookings ${bookings.length > 0 ? `(${bookings.length})` : ''}`, icon: '📅' },
        { id: 'tickets', label: `My Tickets ${tickets.length > 0 ? `(${tickets.length})` : ''}`, icon: '🎫' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ── Page Header ─────────────────────────────────────── */}
                <div className="mb-8 text-center pt-4">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 leading-normal">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 pb-2">Account</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Manage your profile and campus activity</p>
                </div>

                {/* ── Main Layout: Sidebar + Content ──────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

                    {/* ══ LEFT SIDEBAR ══════════════════════════════════ */}
                    <div className="space-y-5">

                        {/* Avatar card */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 flex flex-col items-center text-center">
                            {/* Avatar */}
                            <div className="relative mb-4">
                                <div className="w-28 h-28 rounded-full ring-4 ring-blue-500/30 ring-offset-4 ring-offset-slate-800 overflow-hidden shadow-2xl shadow-blue-500/20">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                </div>
                                {/* Online badge */}
                                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-800 shadow"></span>
                            </div>

                            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                            <p className="text-slate-400 text-sm mt-1 mb-3">{user?.email}</p>

                            {/* Role badge */}
                            <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${roleBadgeColor(user?.role)} shadow-md mb-5`}>
                                {user?.role}
                            </span>

                            {/* Action buttons */}
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all mb-2 cursor-pointer ${activeTab === 'profile'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>

                        {/* Quick Stats card */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <span>📊</span> Quick Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <StatTile
                                    value={bookings.length}
                                    label="Bookings"
                                    color="text-blue-400"
                                    onClick={() => setActiveTab('bookings')}
                                />
                                <StatTile
                                    value={tickets.length}
                                    label="Tickets"
                                    color="text-purple-400"
                                    onClick={() => setActiveTab('tickets')}
                                />
                                <StatTile
                                    value={bookings.filter(b => b.status === 'APPROVED').length}
                                    label="Approved"
                                    color="text-emerald-400"
                                />
                                <StatTile
                                    value={tickets.filter(t => t.status === 'OPEN').length}
                                    label="Open Tickets"
                                    color="text-amber-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ══ RIGHT CONTENT ═════════════════════════════════ */}
                    <div className="space-y-5">

                        {/* Profile Completion Bar */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl px-6 py-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-slate-300 font-semibold text-sm">Profile Completion</span>
                                <span className={`text-sm font-bold ${completionScore === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>
                                    {completionScore}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${completionScore}%`,
                                        background: completionScore === 100
                                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                                            : 'linear-gradient(90deg, #3b82f6, #a855f7)',
                                    }}
                                />
                            </div>
                            <p className="text-slate-500 text-xs mt-2">
                                {completionScore === 100
                                    ? '✅ Your profile is complete!'
                                    : `Complete your profile to unlock all features. Missing: ${missingFields.join(', ')}`}
                            </p>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-1 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1.5 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ── Tab: Profile ─────────────────────────────── */}
                        {activeTab === 'profile' && (
                            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-5">
                                {/* Account Information */}
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Account Information
                                    </h3>

                                    <form onSubmit={handleUpdateProfile}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                            {/* Display Name (editable) */}
                                            <InfoField
                                                label="Display Name"
                                                icon="👤"
                                                editable
                                                value={name}
                                                onChange={(v) => setName(v)}
                                            />

                                            {/* Email (read-only) */}
                                            <InfoField
                                                label="Email Address"
                                                icon="✉️"
                                                value={user?.email}
                                                readOnly
                                                verified
                                            />

                                            {/* Phone Number (editable) */}
                                            <InfoField
                                                label="Phone Number"
                                                icon="📱"
                                                editable
                                                value={phoneNumber}
                                                onChange={(v) => {
                                                    const numbersOnly = v.replace(/[^0-9]/g, '');
                                                    if (numbersOnly.length <= 10) {
                                                        setPhoneNumber(numbersOnly);
                                                    }
                                                }}
                                                placeholder="Enter your phone number"
                                            />

                                            {/* Member Since (read-only) */}
                                            <InfoField
                                                label="Member Since"
                                                icon="📅"
                                                value={formatDate(user?.createdAt)}
                                                readOnly
                                                verified
                                            />
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 cursor-pointer"
                                            >
                                                {isUpdating ? (
                                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Update Profile
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Danger Zone */}
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-red-900/40 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-red-400 mb-1 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Danger Zone
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>

                                    {!showDeleteConfirm ? (
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600/25 text-red-400 border border-red-600/40 rounded-xl font-medium transition-all cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Account
                                        </button>
                                    ) : (
                                        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-4">
                                            <p className="text-red-300 text-sm font-medium mb-3">
                                                ⚠️ Are you sure? This will permanently delete your account.
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={isDeleting}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all cursor-pointer"
                                                >
                                                    {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Tab: My Bookings ─────────────────────────── */}
                        {activeTab === 'bookings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                                            <span>📅</span> My Bookings
                                        </h3>
                                        <Link
                                            to="/bookings/new"
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            <span>+</span> New Booking
                                        </Link>
                                    </div>

                                    {bookingsLoading ? (
                                        <LoadingSkeleton rows={4} />
                                    ) : bookings.length === 0 ? (
                                        <EmptyState icon="📅" text="No bookings yet" subtext="Book a facility to get started." actionTo="/facilities" actionLabel="Browse Facilities" />
                                    ) : (
                                        <div className="space-y-3">
                                            {bookings.map((booking) => (
                                                <Link
                                                    key={booking.id}
                                                    to={`/bookings/${booking.id}`}
                                                    className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-blue-500/30 hover:bg-slate-900/80 transition-all group"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors truncate">
                                                            {booking.facilityName || 'Facility Booking'}
                                                        </p>
                                                        <p className="text-slate-500 text-xs mt-0.5">
                                                            {formatDate(booking.startTime)} → {formatDate(booking.endTime)}
                                                        </p>
                                                    </div>
                                                    <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(booking.status)} whitespace-nowrap`}>
                                                        {booking.status}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Tab: My Tickets ──────────────────────────── */}
                        {activeTab === 'tickets' && (
                            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                                            <span>🎫</span> My Tickets
                                        </h3>
                                        <Link
                                            to="/tickets/new"
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                        >
                                            <span>+</span> New Ticket
                                        </Link>
                                    </div>

                                    {ticketsLoading ? (
                                        <LoadingSkeleton rows={4} />
                                    ) : tickets.length === 0 ? (
                                        <EmptyState icon="🎫" text="No tickets yet" subtext="Submit a maintenance or support ticket." actionTo="/tickets/new" actionLabel="Create Ticket" />
                                    ) : (
                                        <div className="space-y-3">
                                            {tickets.map((ticket) => (
                                                <Link
                                                    key={ticket.id}
                                                    to={`/tickets/${ticket.id}`}
                                                    className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-purple-500/30 hover:bg-slate-900/80 transition-all group"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors truncate">
                                                            {ticket.title || 'Support Ticket'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-slate-500 text-xs">{ticket.category}</span>
                                                            {ticket.priority && (
                                                                <span className={`text-xs font-semibold ${ticket.priority === 'HIGH' ? 'text-red-400' : ticket.priority === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'}`}>
                                                                    • {ticket.priority}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge(ticket.status)} whitespace-nowrap`}>
                                                        {ticket.status?.replace('_', ' ')}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Reusable sub-components ─────────────────────────────────────────── */

function InfoField({ label, icon, value, editable, readOnly, verified, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value || ''}
                    onChange={editable ? (e) => onChange(e.target.value) : undefined}
                    readOnly={readOnly}
                    placeholder={placeholder || ''}
                    className={`w-full px-4 py-3 pr-10 rounded-xl text-sm border transition-all ${readOnly
                        ? 'bg-slate-900/30 border-slate-700/50 text-slate-400 cursor-default'
                        : 'bg-slate-900/60 border-slate-600 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30'
                        }`}
                />
                {verified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" title="Verified">
                        ●
                    </span>
                )}
                {readOnly && !verified && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                        🔒
                    </span>
                )}
            </div>
        </div>
    );
}

function StatTile({ value, label, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-center transition-all ${onClick ? 'hover:border-blue-500/30 cursor-pointer hover:bg-slate-900/80' : 'cursor-default'}`}
        >
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{label}</p>
        </button>
    );
}

function LoadingSkeleton({ rows = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-700/30 rounded-xl animate-pulse" />
            ))}
        </div>
    );
}

function EmptyState({ icon, text, subtext, actionTo, actionLabel }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-5xl mb-3">{icon}</span>
            <p className="text-white font-semibold">{text}</p>
            <p className="text-slate-500 text-sm mt-1 mb-4">{subtext}</p>
            {actionTo && (
                <Link
                    to={actionTo}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}
