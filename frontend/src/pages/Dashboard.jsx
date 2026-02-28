import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Facilities from './Facilities';
import ManageFacilities from './ManageFacilities';
import ManageBookings from './ManageBookings';
import AdminUsers from './AdminUsers';
import ManageTickets from './ManageTickets';
import TechnicianDashboard from './TechnicianDashboard';
import ManagerDashboard from './ManagerDashboard';

/**
 * Dashboard — The main hub for the Smart Campus Operations Hub.
 *
 * Shows overview stats, quick actions, recent activity, and system status.
 * Content adapts based on user role (ADMIN sees more data).
 */
export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, admins: 0, managers: 0, technicians: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, facilities, manage-facilities, manage-bookings, users

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
    const modules = [
        {
            icon: '📋',
            name: 'Resource Booking',
            description: 'Book classrooms, labs, and meeting rooms across campus.',
            color: 'from-blue-600 to-blue-800',
            borderColor: 'border-blue-500/30',
            status: 'Available',
        },
        {
            icon: '📅',
            name: 'My Bookings',
            description: 'View and manage your personal resource booking requests.',
            color: 'from-indigo-600 to-indigo-800',
            borderColor: 'border-indigo-500/30',
            status: 'Active',
        },
        {
            icon: '🔧',
            name: 'Maintenance Requests',
            description: 'Submit and track facility maintenance and repair requests.',
            color: 'from-amber-600 to-amber-800',
            borderColor: 'border-amber-500/30',
            status: 'Active',
        },
        {
            icon: '📅',
            name: 'Event Management',
            description: 'Organize and manage campus events, workshops, and seminars.',
            color: 'from-purple-600 to-purple-800',
            borderColor: 'border-purple-500/30',
            status: 'Coming Soon',
        },
        {
            icon: '🔔',
            name: 'Notifications',
            description: 'Real-time alerts for campus announcements and updates.',
            color: 'from-emerald-600 to-emerald-800',
            borderColor: 'border-emerald-500/30',
            status: 'Coming Soon',
        },
    ];

    const systemStatus = [
        { name: 'Backend API', status: 'Operational', color: 'bg-emerald-400' },
        { name: 'MongoDB Atlas', status: 'Connected', color: 'bg-emerald-400' },
        { name: 'Google OAuth', status: 'Active', color: 'bg-emerald-400' },
        { name: 'JWT Auth', status: 'Enabled', color: 'bg-emerald-400' },
    ];

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Welcome Header ────────────────────────────────── */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        {greeting}, <span className="text-blue-400">{user?.name?.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Here's what's happening on your campus today.
                    </p>
                </div>

                {/* ── Stats Cards (Admin only) ──────────────────────── */}
                {user?.role === 'ADMIN' && (
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

                {/* ── Admin Tab Navigation ─────────────────────────── */}
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'TECHNICIAN') && (
                    <div className="flex gap-1 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1.5 mb-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview', icon: '📊', roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
                            { id: 'facilities', label: 'Facilities', icon: '🏫', roles: ['ADMIN'] },
                            { id: 'manage-facilities', label: 'Manage Facilities', icon: '🏗️', roles: ['ADMIN'] },
                            { id: 'manage-bookings', label: 'Manage Bookings', icon: '📅', roles: ['ADMIN'] },
                            { id: 'manage-tickets', label: 'Manage Tickets', icon: '🎫', roles: ['ADMIN'] },
                            { id: 'manager-tickets', label: 'Manage Tickets', icon: '🎫', roles: ['MANAGER'] },
                            { id: 'technician-tickets', label: 'My Assigned Tickets', icon: '🔧', roles: ['TECHNICIAN'] },
                            { id: 'users', label: 'Users', icon: '👥', roles: ['ADMIN'] },
                        ].filter(tab => tab.roles.includes(user?.role)).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                <span>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Tab Content ──────────────────────────────────── */}
                <div className="min-h-[400px]">
                    {activeTab === 'overview' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* ── Campus Modules (Main Content) ─────────────── */}
                            <div className="lg:col-span-2">
                                <h2 className="text-lg font-semibold text-white mb-4">Campus Operations Modules</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {modules.map((mod) => (
                                        <Link
                                            key={mod.name}
                                            to={mod.name === 'Resource Booking' ? '/facilities' : mod.name === 'My Bookings' ? '/bookings' : mod.name === 'Maintenance Requests' ? '/tickets' : '#'}
                                            className={`group relative bg-slate-800/60 backdrop-blur-sm border ${mod.borderColor} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer block`}
                                        >
                                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${mod.color}`}></div>
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-3xl">{mod.icon}</span>
                                                <span className="px-2 py-0.5 bg-slate-700/80 text-slate-400 text-xs rounded-full">
                                                    {mod.status}
                                                </span>
                                            </div>
                                            <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                                                {mod.name}
                                            </h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {mod.description}
                                            </p>
                                        </Link>
                                    ))}
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

                                {/* User Info Card */}
                                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                                    <h3 className="text-white font-semibold mb-4">Your Profile</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.name}
                                                className="w-14 h-14 rounded-full border-2 border-blue-500/30"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-medium">{user?.name}</p>
                                            <p className="text-slate-400 text-sm">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-t border-slate-700">
                                        <span className="text-slate-400 text-sm">Role</span>
                                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                                            {user?.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-t border-slate-700">
                                        <span className="text-slate-400 text-sm">Provider</span>
                                        <span className="text-slate-300 text-sm capitalize">{user?.provider}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
