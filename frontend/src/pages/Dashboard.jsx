import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Facilities from './Facilities';
import ManageFacilities from './ManageFacilities';
import ManageBookings from './ManageBookings';
import AdminUsers from './AdminUsers';
import ManageTickets from './ManageTickets';
import ManageEvents from './ManageEvents';
import TechnicianDashboard from './TechnicianDashboard';
import ManagerDashboard from './ManagerDashboard';

/**
 * Dashboard — The main hub for the Smart Campus Operations Hub.
 *
 * Shows overview stats, quick actions, recent activity, and system status.
 * Content adapts based on user role (ADMIN sees more data).
 */
export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, admins: 0, managers: 0, technicians: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, facilities, manage-facilities, manage-bookings, users
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/login');
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            // Only admins can fetch user counts
            if (user?.role === 'ADMIN') {
                try {
                    const response = await api.get('/users');
                    const users = response.data.data;
                    setStats({
                        totalUsers: users.length,
                        admins: users.filter(u => u.role === 'ADMIN').length,
                        managers: users.filter(u => u.role === 'MANAGER').length,
                        technicians: users.filter(u => u.role === 'TECHNICIAN').length,
                    });
                } catch (err) {
                    console.error('Failed to fetch stats', err);
                }
            }
            setIsLoading(false);
        };
        fetchStats();
    }, [user]);

    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    // Modules for the campus hub — these represent modules your team will build
    const modules = [];

    const systemStatus = [
        { name: 'Backend API', status: 'Operational', color: 'bg-emerald-400' },
        { name: 'MongoDB Atlas', status: 'Connected', color: 'bg-emerald-400' },
        { name: 'Google OAuth', status: 'Active', color: 'bg-emerald-400' },
        { name: 'JWT Auth', status: 'Enabled', color: 'bg-emerald-400' },
    ];

    return (
        <div className="min-h-screen bg-slate-900">
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'TECHNICIAN') ? (
                <div className="flex">
                    {/* ── Left Sidebar Navigation (Desktop) ───────────────────────── */}
                    <aside className="hidden lg:flex lg:flex-col w-64 fixed left-0 top-0 bottom-0 bg-slate-800/80 backdrop-blur-xl border-r border-slate-700/50 z-30">
                        {/* Brand/Logo */}
                        <div className="p-6 border-b border-slate-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="text-white text-xl font-bold">S</span>
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-white tracking-tight block">
                                        Smart Campus
                                    </span>
                                    <span className="text-xs text-slate-400">Admin Dashboard</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Header - Fixed */}
                        <div className="px-8 py-3 border-b border-slate-700/50 bg-slate-800/80 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Navigation
                            </h2>
                        </div>

                        {/* Navigation Items - Scrollable */}
                        <div className="flex-1 overflow-y-auto sidebar-scroll px-4 py-4 scroll-smooth">
                            <div>
                                <div className="space-y-1">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: '📊', roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
                                        { id: 'facilities', label: 'Facilities', icon: '🏫', roles: ['ADMIN'] },
                                        { id: 'manage-facilities', label: 'Manage Facilities', icon: '🏗️', roles: ['ADMIN'] },
                                        { id: 'manage-bookings', label: 'Manage Bookings', icon: '📅', roles: ['ADMIN'] },
                                        { id: 'maintenance-requests', label: 'Maintenance Requests', icon: '🔧', roles: ['ADMIN'] },
                                        { id: 'event-management', label: 'Event Management', icon: '📅', roles: ['ADMIN'] },
                                        { id: 'notifications', label: 'Notifications', icon: '🔔', roles: ['ADMIN'] },
                                        { id: 'manage-tickets', label: 'Manage Tickets', icon: '🎫', roles: ['ADMIN'] },
                                        { id: 'manager-tickets', label: 'Manage Tickets', icon: '🎫', roles: ['MANAGER'] },
                                        { id: 'technician-tickets', label: 'My Assigned Tickets', icon: '🔧', roles: ['TECHNICIAN'] },
                                        { id: 'users', label: 'Users', icon: '👥', roles: ['ADMIN'] },
                                    ].filter(tab => tab.roles.includes(user?.role)).map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="text-lg">{tab.icon}</span>
                                            <span className="text-left">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {/* Bottom padding to prevent last item from being hidden */}
                                <div className="h-4"></div>
                            </div>
                        </div>

                        {/* User Profile Section at Bottom */}
                        <div className="border-t border-slate-700/50 p-4 bg-slate-800/80 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all group cursor-pointer ${dropdownOpen
                                        ? 'bg-slate-700/50 border-blue-500/40'
                                        : 'border-transparent hover:bg-slate-700/30 hover:border-slate-600'
                                        }`}
                                >
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full border-2 border-blue-500/40 object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold relative">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-800"></span>
                                        </div>
                                    )}
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-white text-sm font-semibold truncate">{user?.name?.split(' ')[0]}</p>
                                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">{user?.role}</p>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown above the button */}
                                {dropdownOpen && (
                                    <div className="absolute left-0 right-0 bottom-full mb-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                                        <div className="p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer group"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* ── Main Content Area ─────────────────────────── */}
                    <div className="flex-1 lg:ml-64">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            {/* ── Mobile Header with Branding and User Info ─────────────────────────── */}
                            <div className="lg:hidden mb-6 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                            <span className="text-white text-xl font-bold">S</span>
                                        </div>
                                        <div>
                                            <span className="text-base font-bold text-white tracking-tight block">
                                                Smart Campus
                                            </span>
                                            <span className="text-xs text-slate-400">Admin Dashboard</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full border-2 border-blue-500/40 object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-all"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── Stats Cards (Admin only) ──────────────────────── */}
                            {user?.role === 'ADMIN' && activeTab === 'overview' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <StatCard
                                        icon="👥"
                                        label="Total Users"
                                        value={stats.totalUsers}
                                        change="+1 today"
                                        color="blue"
                                        isLoading={isLoading}
                                    />
                                    <StatCard
                                        icon="🛡️"
                                        label="Admins"
                                        value={stats.admins}
                                        change="System admins"
                                        color="red"
                                        isLoading={isLoading}
                                    />
                                    <StatCard
                                        icon="👔"
                                        label="Managers"
                                        value={stats.managers}
                                        change="Dept. managers"
                                        color="purple"
                                        isLoading={isLoading}
                                    />
                                    <StatCard
                                        icon="🔧"
                                        label="Technicians"
                                        value={stats.technicians}
                                        change="Maintenance staff"
                                        color="amber"
                                        isLoading={isLoading}
                                    />
                                </div>
                            )}

                            {/* ── Mobile Tab Navigation (Horizontal) ─────────────────────────── */}
                            <div className="lg:hidden mb-6">
                                <div className="flex gap-1 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1.5 overflow-x-auto hide-scrollbar">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: '📊', roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
                                        { id: 'facilities', label: 'Facilities', icon: '🏫', roles: ['ADMIN'] },
                                        { id: 'manage-facilities', label: 'Manage Facilities', icon: '🏗️', roles: ['ADMIN'] },
                                        { id: 'manage-bookings', label: 'Manage Bookings', icon: '📅', roles: ['ADMIN'] },
                                        { id: 'maintenance-requests', label: 'Maintenance Requests', icon: '🔧', roles: ['ADMIN'] },
                                        { id: 'event-management', label: 'Event Management', icon: '📅', roles: ['ADMIN'] },
                                        { id: 'notifications', label: 'Notifications', icon: '🔔', roles: ['ADMIN'] },
                                        { id: 'manage-tickets', label: 'Manage Tickets', icon: '🎫', roles: ['ADMIN'] },
                                        { id: 'manager-tickets', label: 'Manage Tickets', icon: '🎫', roles: ['MANAGER'] },
                                        { id: 'technician-tickets', label: 'My Assigned Tickets', icon: '🔧', roles: ['TECHNICIAN'] },
                                        { id: 'users', label: 'Users', icon: '👥', roles: ['ADMIN'] },
                                    ].filter(tab => tab.roles.includes(user?.role)).map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span>{tab.icon}</span>
                                            <span>{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Tab Content ──────────────────────────────────── */}
                            <div className="min-h-[400px]">
                                {activeTab === 'overview' ? (
                                    <>
                                        {/* ── Welcome Header ────────────────────────────────── */}
                                        <div className="mb-8">
                                            <h1 className="text-3xl font-bold text-white">
                                                {greeting}, <span className="text-blue-400">{user?.name?.split(' ')[0]}</span> 👋
                                            </h1>
                                            <p className="text-slate-400 mt-1">
                                                Here's what's happening on your campus today.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {/* ── Welcome Message (Main Content) ─────────────── */}
                                            <div className="lg:col-span-2">
                                                <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/5 border border-blue-500/20 rounded-2xl p-8">
                                                    <h2 className="text-2xl font-bold text-white mb-3">Welcome to Your Dashboard</h2>
                                                    <p className="text-slate-300 text-base leading-relaxed mb-4">
                                                        Use the sidebar navigation to access different sections of the Smart Campus Hub.
                                                        Manage facilities, bookings, tickets, and more from this central control panel.
                                                    </p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                                        <div className="flex items-center gap-3 text-slate-300">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                                                <span className="text-xl">🏫</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">Manage Facilities</p>
                                                                <p className="text-xs text-slate-400">Control campus resources</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-300">
                                                            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                                                                <span className="text-xl">📅</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">Handle Bookings</p>
                                                                <p className="text-xs text-slate-400">Process reservations</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-300">
                                                            <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center">
                                                                <span className="text-xl">🎫</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">Manage Tickets</p>
                                                                <p className="text-xs text-slate-400">Track support requests</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-300">
                                                            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                                                                <span className="text-xl">👥</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">User Administration</p>
                                                                <p className="text-xs text-slate-400">Manage accounts & roles</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Sidebar ───────────────────────────────────── */}
                                            <div className="space-y-6">
                                                {/* System Status */}
                                                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                                        System Status
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {systemStatus.map((item) => (
                                                            <div key={item.name} className="flex items-center justify-between">
                                                                <span className="text-slate-400 text-sm">{item.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-1.5 h-1.5 ${item.color} rounded-full`}></span>
                                                                    <span className="text-emerald-400 text-xs font-medium">{item.status}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : activeTab === 'facilities' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Facilities standalone={true} />
                                    </div>
                                ) : activeTab === 'manage-facilities' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ManageFacilities standalone={true} />
                                    </div>
                                ) : activeTab === 'manage-bookings' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ManageBookings standalone={true} />
                                    </div>
                                ) : activeTab === 'maintenance-requests' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                                            <div className="text-6xl mb-4">🔧</div>
                                            <h2 className="text-2xl font-bold text-white mb-2">Maintenance Requests</h2>
                                            <p className="text-slate-400 max-w-md mx-auto">Submit and track facility maintenance and repair requests.</p>
                                            <p className="text-slate-500 text-sm mt-4">Coming Soon</p>
                                        </div>
                                    </div>
                                ) : activeTab === 'event-management' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ManageEvents standalone={true} />
                                    </div>
                                ) : activeTab === 'notifications' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                                            <div className="text-6xl mb-4">🔔</div>
                                            <h2 className="text-2xl font-bold text-white mb-2">Notifications</h2>
                                            <p className="text-slate-400 max-w-md mx-auto">Real-time alerts for campus announcements and updates.</p>
                                            <p className="text-slate-500 text-sm mt-4">Coming Soon</p>
                                        </div>
                                    </div>
                                ) : activeTab === 'manage-tickets' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ManageTickets standalone={true} />
                                    </div>
                                ) : activeTab === 'manager-tickets' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <ManagerDashboard standalone={true} />
                                    </div>
                                ) : activeTab === 'technician-tickets' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <TechnicianDashboard standalone={true} />
                                    </div>
                                ) : activeTab === 'users' ? (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <AdminUsers standalone={true} />
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

/* ── Reusable Components ──────────────────────────────────────────── */

function StatCard({ icon, label, value, change, color, isLoading }) {
    const colorMap = {
        blue: 'from-blue-600/20 to-blue-600/5 border-blue-500/20',
        red: 'from-red-600/20 to-red-600/5 border-red-500/20',
        purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20',
        amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20',
    };

    const textColor = {
        blue: 'text-blue-400',
        red: 'text-red-400',
        purple: 'text-purple-400',
        amber: 'text-amber-400',
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
            </div>
            {isLoading ? (
                <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1"></div>
            ) : (
                <p className={`text-3xl font-bold ${textColor[color]}`}>{value}</p>
            )}
            <p className="text-slate-400 text-sm mt-1">{label}</p>
            <p className="text-slate-500 text-xs mt-0.5">{change}</p>
        </div>
    );
}

function ActivityItem({ icon, text, time }) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">{icon}</span>
            <div className="flex-1">
                <p className="text-slate-300 text-sm">{text}</p>
                <p className="text-slate-500 text-xs">{time}</p>
            </div>
        </div>
    );
}
