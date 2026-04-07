import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ManageFacilities from './ManageFacilities';
import ManageBookings from './ManageBookings';
import AdminUsers from './AdminUsers';
import ManageTickets from './ManageTickets';
import ManageEvents from './ManageEvents';
import ManageTransport from './ManageTransport';
import TechnicianDashboard from './TechnicianDashboard';
import ManagerDashboard from './ManagerDashboard';
import ManageAttendance from './ManageAttendance';
import ManageLostFound from './ManageLostFound';
import { ShuttleMap } from './TransportMap';

/* ─── SVG Icon Components ────────────────────────────────────────────── */
const Icons = {
    overview: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    ),
    manageFacilities: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
        </svg>
    ),
    bookings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    ),
    events: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
    ),
    tickets: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
    ),
    transport: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
    ),
    lostFound: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
    ),
    attendance: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
    ),
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    ),
    chevronDown: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
    ),
    logout: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
    search: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    home: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    ),
    menu: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    ),
    close: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    profile: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    shuttle: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
    ),
};

/* ─── Navigation Tab Definitions ──────────────────────────────────────── */
const NAV_TABS = [
    { id: 'overview', label: 'Overview', icon: Icons.overview, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'], section: 'Main' },
    { id: 'manage-facilities', label: 'Manage Facilities', icon: Icons.manageFacilities, roles: ['ADMIN'], section: 'Management' },
    { id: 'manage-bookings', label: 'Bookings', icon: Icons.bookings, roles: ['ADMIN', 'MANAGER'], section: 'Management' },
    { id: 'event-management', label: 'Events', icon: Icons.events, roles: ['ADMIN'], section: 'Management' },
    { id: 'manage-tickets', label: 'Tickets', icon: Icons.tickets, roles: ['ADMIN'], section: 'Operations' },
    { id: 'manage-transport', label: 'Transport', icon: Icons.transport, roles: ['ADMIN'], section: 'Operations' },
    { id: 'manager-tickets', label: 'Manage Tickets', icon: Icons.tickets, roles: ['MANAGER'], section: 'Operations' },
    { id: 'technician-tickets', label: 'Assigned Tickets', icon: Icons.maintenance, roles: ['TECHNICIAN'], section: 'Operations' },
    { id: 'manage-lost-found', label: 'Lost & Found', icon: Icons.lostFound, roles: ['ADMIN'], section: 'Operations' },
    { id: 'attendance', label: 'Attendance', icon: Icons.attendance, roles: ['ADMIN', 'MANAGER'], section: 'Operations' },
    { id: 'users', label: 'Users', icon: Icons.users, roles: ['ADMIN'], section: 'System' },
];

/**
 * Dashboard — Premium admin panel for the Smart Campus Operations Hub.
 */
export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, admins: 0, managers: 0, technicians: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/login');
    };

    // Live clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

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

    // Close mobile menu on tab change
    const handleTabChange = useCallback((id) => {
        setActiveTab(id);
        setSearchParams({ tab: id });
        setMobileMenuOpen(false);
    }, [setSearchParams]);

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
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

    const currentHour = currentTime.getHours();
    const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

    const systemStatus = [
        { name: 'Backend API', status: 'Operational', ok: true },
        { name: 'MongoDB Atlas', status: 'Connected', ok: true },
        { name: 'Google OAuth', status: 'Active', ok: true },
        { name: 'JWT Auth', status: 'Enabled', ok: true },
    ];

    const filteredTabs = NAV_TABS.filter(tab => tab.roles.includes(user?.role));
    const sections = [...new Set(filteredTabs.map(t => t.section))];
    const activeTabObj = NAV_TABS.find(t => t.id === activeTab);

    if (!user || !['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(user?.role)) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* ── Mobile Menu Overlay ────────────────────────── */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div className="flex">
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* ── SIDEBAR ─────────────────────────────────────────────── */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <aside className={`
                    fixed top-0 bottom-0 z-50
                    flex flex-col
                    bg-slate-900/95 backdrop-blur-2xl
                    border-r border-slate-800/80
                    transition-all duration-300 ease-in-out
                    ${mobileMenuOpen ? 'left-0' : '-left-72 lg:left-0'}
                    ${sidebarCollapsed ? 'w-[72px]' : 'w-[264px]'}
                `}>
                    {/* Brand Header */}
                    <div className={`
                        flex items-center h-16 border-b border-slate-800/80
                        ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5'}
                    `}>
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-[15px] font-bold text-white tracking-tight">
                                        Smart Campus<span className="text-blue-500">.</span>
                                    </span>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase -mt-0.5">Operations Hub</p>
                                </div>
                            </div>
                        )}
                        {sidebarCollapsed && (
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </div>
                        )}

                        {/* Collapse button - desktop only */}
                        <button
                            onClick={() => setSidebarCollapsed(prev => !prev)}
                            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                            <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>

                        {/* Close button - mobile only */}
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            {Icons.close}
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
                        {sections.map((section, sIdx) => {
                            const sectionTabs = filteredTabs.filter(t => t.section === section);
                            return (
                                <div key={section} className={sIdx > 0 ? 'mt-5' : ''}>
                                    {!sidebarCollapsed && (
                                        <div className="px-5 mb-2">
                                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-[0.12em]">{section}</p>
                                        </div>
                                    )}
                                    {sidebarCollapsed && sIdx > 0 && (
                                        <div className="mx-3 mb-3 border-t border-slate-800/60" />
                                    )}
                                    <div className={`space-y-0.5 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
                                        {sectionTabs.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => handleTabChange(tab.id)}
                                                title={sidebarCollapsed ? tab.label : undefined}
                                                className={`
                                                    group w-full flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-200 cursor-pointer
                                                    ${sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                                                    ${activeTab === tab.id
                                                        ? 'bg-blue-600/15 text-blue-400 shadow-sm'
                                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                                    }
                                                `}
                                            >
                                                <span className={`shrink-0 transition-colors ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                                    {tab.icon}
                                                </span>
                                                {!sidebarCollapsed && (
                                                    <span className="truncate">{tab.label}</span>
                                                )}
                                                {!sidebarCollapsed && activeTab === tab.id && (
                                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sidebar User Profile Footer */}
                    <div className="border-t border-slate-800/80 p-3">
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(prev => !prev)}
                                className={`
                                    w-full flex items-center gap-3 rounded-xl transition-all group cursor-pointer
                                    ${sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2.5'}
                                    ${dropdownOpen
                                        ? 'bg-slate-800 ring-1 ring-blue-500/30'
                                        : 'hover:bg-slate-800/60'
                                    }
                                `}
                            >
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-9 h-9 rounded-lg border-2 border-slate-700 object-cover shrink-0"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 relative">
                                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                )}
                                {!sidebarCollapsed && (
                                    <>
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-white text-sm font-semibold truncate">{user?.name?.split(' ')[0]}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{user?.role}</p>
                                        </div>
                                        <span className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}>
                                            {Icons.chevronDown}
                                        </span>
                                    </>
                                )}
                            </button>

                            {/* User Dropdown */}
                            {dropdownOpen && (
                                <div className={`
                                    absolute bottom-full mb-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden
                                    ${sidebarCollapsed ? 'left-full ml-2 bottom-0 mb-0 w-48' : 'left-0 right-0'}
                                `}>
                                    <div className="p-1.5">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
                                        >
                                            {Icons.logout}
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* ── MAIN CONTENT AREA ────────────────────────────────────── */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className={`
                    flex-1 min-h-screen transition-all duration-300
                    ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[264px]'}
                `}>
                    {/* ── Topbar ──────────────────────────────────────── */}
                    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
                        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
                            {/* Left: Mobile menu + Breadcrumb */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMobileMenuOpen(true)}
                                    className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    {Icons.menu}
                                </button>
                                <div className="hidden sm:flex items-center gap-2 text-sm">
                                    <span className="text-slate-500">Dashboard</span>
                                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                    <span className="text-slate-300 font-medium">{activeTabObj?.label || 'Overview'}</span>
                                </div>
                            </div>

                            {/* Right: Time & actions */}
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-slate-400 font-medium">
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* ── Page Content ──────────────────────────────────── */}
                    <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                        {/* ── Overview Tab ─────────────────────────────────── */}
                        {activeTab === 'overview' ? (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Welcome Header */}
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                                            {greeting}, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">{user?.name?.split(' ')[0]}</span>
                                        </h1>
                                        <p className="text-slate-400 mt-1 text-sm lg:text-base">
                                            Here's what's happening on your campus today.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">
                                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Cards (Admin) */}
                                {user?.role === 'ADMIN' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            icon={Icons.users}
                                            label="Total Users"
                                            value={stats.totalUsers}
                                            subtitle="All accounts"
                                            color="blue"
                                            isLoading={isLoading}
                                        />
                                        <StatCard
                                            icon={
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                </svg>
                                            }
                                            label="Admins"
                                            value={stats.admins}
                                            subtitle="System admins"
                                            color="red"
                                            isLoading={isLoading}
                                        />
                                        <StatCard
                                            icon={
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                                                </svg>
                                            }
                                            label="Managers"
                                            value={stats.managers}
                                            subtitle="Dept. managers"
                                            color="purple"
                                            isLoading={isLoading}
                                        />
                                        <StatCard
                                            icon={Icons.maintenance}
                                            label="Technicians"
                                            value={stats.technicians}
                                            subtitle="Maintenance staff"
                                            color="amber"
                                            isLoading={isLoading}
                                        />
                                    </div>
                                )}

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Welcome Card */}
                                    <div className="lg:col-span-2">
                                        <div className="relative overflow-hidden bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-6 lg:p-8">
                                            {/* Decorative elements */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                                            <div className="relative">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                                        Dashboard
                                                    </span>
                                                </div>
                                                <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Welcome to Your Control Center</h2>
                                                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg">
                                                    Use the sidebar navigation to manage every aspect of the Smart Campus Hub.
                                                    From facilities and bookings to tickets and user management.
                                                </p>

                                                {/* Quick action cards */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { icon: Icons.facilities, label: 'Facilities', desc: 'Manage resources', color: 'blue', tab: 'manage-facilities' },
                                                        { icon: Icons.bookings, label: 'Bookings', desc: 'Process reservations', color: 'purple', tab: 'manage-bookings' },
                                                        { icon: Icons.tickets, label: 'Tickets', desc: 'Support requests', color: 'amber', tab: 'manage-tickets' },
                                                        { icon: Icons.users, label: 'Users', desc: 'Manage accounts', color: 'emerald', tab: 'users' },
                                                    ].filter(item => {
                                                        if (item.tab === 'manage-bookings') return ['ADMIN', 'MANAGER'].includes(user?.role);
                                                        return user?.role === 'ADMIN';
                                                    }).map(item => (
                                                        <button
                                                            key={item.label}
                                                            onClick={() => setActiveTab(item.tab)}
                                                            className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/30 hover:border-slate-600/50 transition-all text-left cursor-pointer"
                                                        >
                                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                                item.color === 'blue' ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20' :
                                                                item.color === 'purple' ? 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20' :
                                                                item.color === 'amber' ? 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20' :
                                                                'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20'
                                                            }`}>
                                                                {item.icon}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">{item.label}</p>
                                                                <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Status */}
                                    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-white font-semibold text-sm">System Health</h3>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">All Systems Go</span>
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {systemStatus.map((item) => (
                                                <div key={item.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                                        <span className="text-slate-300 text-sm">{item.name}</span>
                                                    </div>
                                                    <span className={`text-xs font-medium ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {item.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Platform Info */}
                                        <div className="mt-5 pt-5 border-t border-slate-800/60">
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">Platform</span>
                                                    <span className="text-xs text-slate-400 font-medium">Smart Campus v2.0</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">Environment</span>
                                                    <span className="text-xs text-emerald-400 font-medium">Production</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">Last Deploy</span>
                                                    <span className="text-xs text-slate-400 font-medium">Today</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Shuttle Map */}
                                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                {Icons.shuttle}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-sm">Live Shuttle Tracker</h3>
                                                <p className="text-slate-500 text-xs">Real-time campus transport</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                            <span className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider">Live</span>
                                        </span>
                                    </div>
                                    <div className="rounded-xl overflow-hidden border border-slate-800/50">
                                        <ShuttleMap height="350px" showControls={false} compact={true} />
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'manage-facilities' ? (
                            <TabWrapper><ManageFacilities standalone={true} /></TabWrapper>
                        ) : activeTab === 'manage-bookings' ? (
                            <TabWrapper><ManageBookings standalone={true} /></TabWrapper>
                        ) : activeTab === 'event-management' ? (
                            <TabWrapper><ManageEvents standalone={true} /></TabWrapper>
                        ) : activeTab === 'manage-tickets' ? (
                            <TabWrapper><ManageTickets standalone={true} /></TabWrapper>
                        ) : activeTab === 'manage-transport' ? (
                            <TabWrapper><ManageTransport standalone={true} /></TabWrapper>
                        ) : activeTab === 'manager-tickets' ? (
                            <TabWrapper><ManagerDashboard standalone={true} /></TabWrapper>
                        ) : activeTab === 'technician-tickets' ? (
                            <TabWrapper><TechnicianDashboard standalone={true} /></TabWrapper>
                        ) : activeTab === 'attendance' ? (
                            <TabWrapper><ManageAttendance standalone={true} /></TabWrapper>
                        ) : activeTab === 'manage-lost-found' ? (
                            <TabWrapper><ManageLostFound standalone={true} /></TabWrapper>
                        ) : activeTab === 'users' ? (
                            <TabWrapper><AdminUsers standalone={true} /></TabWrapper>
                        ) : null}
                    </main>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/* ── Reusable Components ──────────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════════════ */

function TabWrapper({ children }) {
    return (
        <div className="animate-in fade-in duration-300">
            {children}
        </div>
    );
}

function StatCard({ icon, label, value, subtitle, color, isLoading }) {
    const styles = {
        blue: {
            bg: 'bg-blue-500/8',
            border: 'border-blue-500/15',
            icon: 'bg-blue-500/10 text-blue-400',
            value: 'text-blue-400',
            ring: 'ring-blue-500/10',
        },
        red: {
            bg: 'bg-red-500/8',
            border: 'border-red-500/15',
            icon: 'bg-red-500/10 text-red-400',
            value: 'text-red-400',
            ring: 'ring-red-500/10',
        },
        purple: {
            bg: 'bg-purple-500/8',
            border: 'border-purple-500/15',
            icon: 'bg-purple-500/10 text-purple-400',
            value: 'text-purple-400',
            ring: 'ring-purple-500/10',
        },
        amber: {
            bg: 'bg-amber-500/8',
            border: 'border-amber-500/15',
            icon: 'bg-amber-500/10 text-amber-400',
            value: 'text-amber-400',
            ring: 'ring-amber-500/10',
        },
    };

    const s = styles[color] || styles.blue;

    return (
        <div className={`relative overflow-hidden ${s.bg} border ${s.border} rounded-2xl p-5 hover:ring-2 ${s.ring} transition-all duration-200`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${s.icon} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-8 w-20 bg-slate-700/50 rounded-lg animate-pulse" />
                    <div className="h-4 w-28 bg-slate-700/30 rounded animate-pulse" />
                </div>
            ) : (
                <>
                    <p className={`text-3xl font-bold ${s.value} tracking-tight`}>{value}</p>
                    <p className="text-slate-400 text-sm mt-1 font-medium">{label}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
                </>
            )}
        </div>
    );
}

function PlaceholderCard({ icon, title, description }) {
    return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-12 lg:p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">{description}</p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/50">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-slate-400 text-xs font-medium">Coming Soon</span>
            </div>
        </div>
    );
}
