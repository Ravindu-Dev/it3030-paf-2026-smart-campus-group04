import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { getMyEventsCount } from '../services/eventService';
import SmartRecommendations from '../components/SmartRecommendations';
import { getMyAttendance, getMyStats } from '../services/attendanceService';
import toast from 'react-hot-toast';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

function roleBadgeStyle(role) {
    const map = {
        ADMIN: { background: 'linear-gradient(to right, #ef4444, #e11d48)' },
        MANAGER: { background: 'linear-gradient(to right, #a855f7, #7c3aed)' },
        TECHNICIAN: { background: 'linear-gradient(to right, #f59e0b, #ea580c)' },
        USER: { background: 'linear-gradient(to right, #3b82f6, #2563eb)' },
    };
    return map[role] || { background: 'linear-gradient(to right, #64748b, #475569)' };
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
    const location = useLocation();

    /* ── Form state ─────────────────── */
    const [name, setName] = useState(user?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');

    /* ── Attendance data ───────────── */
    const [attendance, setAttendance] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    /* ── ID Card ref ───────────────── */
    const idCardRef = useRef(null);
    const qrRef = useRef(null);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
            // Optional: clear state so refresh doesn't force the tab if the user navigated away
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.tab]);

    /* ── Bookings / Tickets data ────── */
    const [bookings, setBookings] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [registeredEventsCount, setRegisteredEventsCount] = useState(0);

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

    /* ── Fetch attendance ────────────── */
    const fetchAttendance = useCallback(async () => {
        setAttendanceLoading(true);
        try {
            const [historyRes, statsRes] = await Promise.all([
                getMyAttendance(),
                getMyStats(),
            ]);
            setAttendance(historyRes.data.data || []);
            setAttendanceStats(statsRes.data.data || null);
        } catch {
            setAttendance([]);
            setAttendanceStats(null);
        } finally {
            setAttendanceLoading(false);
        }
    }, []);

    /* ── Fetch Registered Events Count ── */
    const fetchEventsCount = useCallback(async () => {
        try {
            const res = await getMyEventsCount();
            setRegisteredEventsCount(res.data?.data || 0);
        } catch {
            setRegisteredEventsCount(0);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
        fetchTickets();
        fetchAttendance();
        fetchEventsCount();
    }, [fetchBookings, fetchTickets, fetchAttendance, fetchEventsCount]);

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

    /* ── Download handlers ──────────── */
    const handleDownloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        const canvasElement = qrRef.current?.querySelector('canvas');

        if (canvasElement) {
            // If it's a canvas (QRCodeCanvas)
            const a = document.createElement('a');
            a.download = `${user?.name?.replace(/\s+/g, '_') || 'QR'}_SmartCampus_QR.png`;
            a.href = canvasElement.toDataURL('image/png');
            a.click();
            return;
        }

        if (svg) {
            // If it's an SVG (fallback/older)
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const a = document.createElement('a');
                a.download = `${user?.name?.replace(/\s+/g, '_') || 'QR'}_SmartCampus_QR.png`;
                a.href = canvas.toDataURL('image/png');
                a.click();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
    };

    const handleDownloadIDCardImage = async () => {
        if (!idCardRef.current) return;
        const toastId = toast.loading('Generating ID Card Image...');
        try {
            const element = idCardRef.current;
            const images = element.getElementsByTagName('img');
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
            }));

            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: false,
                scale: 4,
                logging: false,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
            });

            const a = document.createElement('a');
            a.download = `${user?.name?.replace(/\s+/g, '_') || 'ID'}_SmartCampus_IDCard.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();

            toast.success('ID Card downloaded as Image!', { id: toastId });
        } catch (error) {
            console.error('Image Generation Error:', error);
            toast.error(`Download failed: ${error.message}`, { id: toastId });
        }
    };

    const handleDownloadIDCardPDF = async () => {
        if (!idCardRef.current) return;
        const toastId = toast.loading('Preparing PDF...');
        try {
            const element = idCardRef.current;
            const images = element.getElementsByTagName('img');
            await Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
            }));

            const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: false,
                scale: 4,
                logging: false,
                scrollX: 0,
                scrollY: -window.scrollY,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight,
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const cardWidth = 140;
            const cardHeight = (canvas.height * cardWidth) / canvas.width;

            const x = (pdfWidth - cardWidth) / 2;
            const y = (pdfHeight - cardHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);
            pdf.save(`${user?.name?.replace(/\s+/g, '_') || 'ID'}_SmartCampus_IDCard.pdf`);

            toast.success('ID Card downloaded as PDF!', { id: toastId });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error(`Download failed: ${error.message}`, { id: toastId });
        }
    };

    /* ── QR data ────────────────────── */
    // Compressed for larger modules and better scanning
    const qrData = JSON.stringify({
        id: user?.id,
        t: 'SCI', // Smart Campus ID
    });

    /* ── Tabs config ────────────────── */
    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'id-card', label: 'ID Card', icon: '🪪' },
        { id: 'attendance', label: `Attendance ${attendance.length > 0 ? `(${attendance.length})` : ''}`, icon: '📋' },
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
                <div className="mb-10 pt-16">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 leading-normal drop-shadow-lg">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 pb-2">Account</span>
                    </h1>
                    <p className="text-lg text-slate-300 mt-2 max-w-2xl drop-shadow-md">Manage your personal profile and campus activity</p>
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
                                        <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
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
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 shadow-2xl">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 text-lg">
                                <span className="text-blue-400 text-xl">📊</span> Quick Stats
                            </h3>
                            <div className="space-y-5">
                                {(() => {
                                    const stats = [
                                        { value: bookings.length, label: "Bookings", color: "from-blue-400 to-blue-600", onClick: () => setActiveTab('bookings') },
                                        { value: tickets.length, label: "Tickets", color: "from-purple-400 to-purple-600", onClick: () => setActiveTab('tickets') },
                                        { value: bookings.filter(b => b.status === 'APPROVED').length, label: "Approved", color: "from-emerald-400 to-emerald-600" },
                                        { value: tickets.filter(t => t.status === 'OPEN').length, label: "Open Tickets", color: "from-amber-400 to-amber-600" }
                                    ];

                                    if (registeredEventsCount > 0) {
                                        stats.push({ value: registeredEventsCount, label: "Registered Events", color: "from-rose-400 to-rose-600", onClick: () => navigate('/events', { state: { filter: 'my' } }) });
                                    }

                                    const maxVal = Math.max(...stats.map(s => s.value), 5); // Fallback to 5 for better initial scale

                                    return stats.map((stat, idx) => (
                                        <StatBar
                                            key={idx}
                                            value={stat.value}
                                            label={stat.label}
                                            color={stat.color}
                                            onClick={stat.onClick}
                                            max={maxVal}
                                        />
                                    ));
                                })()}
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

                        {/* AI Recommendations */}
                        <SmartRecommendations />

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

                        {/* ── Tab: ID Card ─────────────────────────────── */}
                        {activeTab === 'id-card' && (
                            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-5">
                                {/* ID Card */}
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2">
                                        🪪 Student / Staff ID Card
                                    </h3>

                                    <div ref={idCardRef} className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                                        {/* Card Header */}
                                        <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8, #4338ca)' }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                                                    <span className="text-white text-xl font-bold">S</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-lg tracking-tight">Smart Campus</p>
                                                    <p className="text-blue-200 text-xs font-medium uppercase tracking-widest" style={{ color: '#bfdbfe' }}>Operations Hub</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 relative" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)' }}>
                                            {/* QR Code - Absolute Position Top Right */}
                                            <div ref={qrRef} className="absolute top-4 right-4 bg-white p-1.5 rounded-lg shadow-xl z-10">
                                                <QRCodeCanvas
                                                    value={qrData}
                                                    size={120} // Adjusted for corner placement
                                                    level="M"
                                                    includeMargin={true}
                                                />
                                            </div>

                                            <div className="flex gap-6">
                                                {/* Photo Section */}
                                                <div className="flex flex-col items-center gap-3">
                                                    <div
                                                        className="w-24 h-24 rounded-xl overflow-hidden"
                                                        style={{
                                                            border: '2px solid rgba(59, 130, 246, 0.4)',
                                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                                                        }}
                                                    >
                                                        {user?.profilePicture ? (
                                                            <img
                                                                src={user.profilePicture}
                                                                alt={user.name}
                                                                className="w-full h-full object-cover"
                                                                referrerPolicy="no-referrer"
                                                                crossOrigin="anonymous"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{ background: 'linear-gradient(to bottom right, #3b82f6, #9333ea)' }}>
                                                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-white text-xl font-bold truncate">{user?.name}</h2>
                                                    <span
                                                        className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                                                        style={roleBadgeStyle(user?.role)}
                                                    >
                                                        {user?.role}
                                                    </span>

                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs w-9" style={{ color: '#64748b' }}>Email</span>
                                                            <span className="text-xs truncate" style={{ color: '#cbd5e1' }}>{user?.email}</span>
                                                        </div>
                                                        {(user?.phoneNumber || phoneNumber) && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs w-9" style={{ color: '#64748b' }}>Phone</span>
                                                                <span className="text-xs" style={{ color: '#cbd5e1' }}>{user?.phoneNumber || phoneNumber}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs w-9" style={{ color: '#64748b' }}>Since</span>
                                                            <span className="text-xs" style={{ color: '#cbd5e1' }}>{formatDate(user?.createdAt)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs w-9" style={{ color: '#64748b' }}>ID</span>
                                                            <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{user?.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="border-t px-6 py-2" style={{ background: 'rgba(37, 99, 235, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                                            <p className="text-[10px] text-center font-medium tracking-wide" style={{ color: 'rgba(96, 165, 250, 0.7)' }}>
                                                Scan QR code to verify identity • Smart Campus © {new Date().getFullYear()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mt-6 justify-center">
                                        <button
                                            onClick={handleDownloadIDCardImage}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download ID as Image
                                        </button>
                                        <button
                                            onClick={handleDownloadIDCardPDF}
                                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Download ID as PDF
                                        </button>
                                        <button
                                            onClick={handleDownloadQR}
                                            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            Download QR Code
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Attendance ─────────────────────────── */}
                        {activeTab === 'attendance' && (
                            <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-5">
                                {/* Stats Cards */}
                                {attendanceStats && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-blue-400">{attendanceStats.totalRecords}</p>
                                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Total</p>
                                        </div>
                                        <div className="bg-slate-800/50 backdrop-blur-xl border border-emerald-700/40 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-emerald-400">{attendanceStats.presentCount}</p>
                                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Present</p>
                                        </div>
                                        <div className="bg-slate-800/50 backdrop-blur-xl border border-amber-700/40 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-amber-400">{attendanceStats.lateCount}</p>
                                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Late</p>
                                        </div>
                                        <div className="bg-slate-800/50 backdrop-blur-xl border border-red-700/40 rounded-xl p-4 text-center">
                                            <p className="text-2xl font-bold text-red-400">{attendanceStats.absentCount}</p>
                                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Absent</p>
                                        </div>
                                    </div>
                                )}

                                {/* Attendance Rate */}
                                {attendanceStats && (
                                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl px-6 py-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-slate-300 font-semibold text-sm">Attendance Rate</span>
                                            <span className={`text-sm font-bold ${attendanceStats.attendanceRate >= 75 ? 'text-emerald-400' : attendanceStats.attendanceRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                {attendanceStats.attendanceRate}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{
                                                    width: `${attendanceStats.attendanceRate}%`,
                                                    background: attendanceStats.attendanceRate >= 75
                                                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                        : attendanceStats.attendanceRate >= 50
                                                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Attendance Records */}
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-blue-400 mb-6 flex items-center gap-2">
                                        <span>📋</span> Attendance History
                                    </h3>

                                    {attendanceLoading ? (
                                        <LoadingSkeleton rows={4} />
                                    ) : attendance.length === 0 ? (
                                        <EmptyState icon="📋" text="No attendance records" subtext="Your attendance will appear here when marked." />
                                    ) : (
                                        <div className="space-y-3">
                                            {attendance.map((record) => (
                                                <div
                                                    key={record.id}
                                                    className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white font-medium text-sm">
                                                            {formatDate(record.markedAt)}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {record.location && (
                                                                <span className="text-slate-500 text-xs flex items-center gap-1">
                                                                    📍 {record.location}
                                                                </span>
                                                            )}
                                                            {record.markedByName && (
                                                                <span className="text-slate-500 text-xs">
                                                                    by {record.markedByName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${record.status === 'PRESENT'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                                        : record.status === 'LATE'
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                                                        } whitespace-nowrap`}>
                                                        {record.status}
                                                    </span>
                                                </div>
                                            ))}
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

function StatBar({ value, label, color, onClick, max }) {
    const percentage = Math.max(5, (value / max) * 100);
    return (
        <div
            onClick={onClick}
            className={`group w-full ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                    {label}
                </span>
                <span className={`text-lg font-black text-transparent bg-clip-text bg-gradient-to-br ${color} drop-shadow-sm`}>
                    {value}
                </span>
            </div>
            <div className="w-full bg-slate-900/60 rounded-full h-2.5 overflow-hidden border border-slate-700/30 p-[1px]">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${color} shadow-[0_0_12px_-2px_rgba(59,130,246,0.3)] shadow-blue-500/20`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
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
