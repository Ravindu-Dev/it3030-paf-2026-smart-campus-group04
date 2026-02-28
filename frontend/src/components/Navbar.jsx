import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — Premium auth-aware navigation bar for the Smart Campus Hub.
 * Features an avatar dropdown for authenticated users.
 */
export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

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

    const isPrivilegedUser = ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(user?.role);

    return (
        <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo / Brand */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
                            <span className="text-white text-xl font-bold">S</span>
                        </div>
                        <div className="hidden lg:block">
                            <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight">
                                Smart Campus
                            </span>
                        </div>
                    </Link>

                    {/* Main Nav Links (Center) */}
                    <div className="hidden md:flex items-center gap-1 xl:gap-2">
                        <NavLink to="/" label="Home" active={isActive('/')} />
                        <NavLink to="/facilities-assets" label="Facilities" active={isActive('/facilities-assets')} />
                        <NavLink to="/about" label="About Us" active={isActive('/about')} />
                        <NavLink to="/contact" label="Contact" active={isActive('/contact')} />
                        <NavLink to="/faq" label="FAQ" active={isActive('/faq')} />
                    </div>

                    {/* Authentication / Profile Area */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {isAuthenticated ? (
                            /* ── Avatar Dropdown ─────────────────────────── */
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-xl border transition-all group cursor-pointer ${dropdownOpen
                                        ? 'bg-slate-800 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                        : 'border-transparent hover:bg-slate-800/60 hover:border-slate-700'
                                        }`}
                                    aria-label="Toggle user menu"
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        {user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.name}
                                                className="w-9 h-9 rounded-full border-2 border-blue-500/40 object-cover shadow-md"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                        {/* Online indicator */}
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
                                    </div>

                                    {/* Name + Role (desktop only) */}
                                    <div className="hidden sm:block text-left">
                                        <p className="text-white text-sm font-semibold leading-none mb-0.5">{user?.name?.split(' ')[0]}</p>
                                        <p className="text-blue-400 text-[10px] font-bold tracking-wider uppercase leading-none">{user?.role}</p>
                                    </div>

                                    {/* Chevron */}
                                    <svg
                                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Panel */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User info header */}
                                        <div className="px-4 py-4 border-b border-slate-700/60 bg-gradient-to-b from-blue-600/10 to-transparent">
                                            <div className="flex items-center gap-3">
                                                {user?.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name}
                                                        className="w-10 h-10 rounded-full border-2 border-blue-500/40"
                                                        referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                                                    <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="p-2">
                                            {!isPrivilegedUser && (
                                                <DropdownItem
                                                    to="/profile"
                                                    label="My Profile"
                                                    icon={
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    }
                                                    active={isActive('/profile')}
                                                    onClick={() => setDropdownOpen(false)}
                                                />
                                            )}

                                            {isPrivilegedUser && (
                                                <DropdownItem
                                                    to="/dashboard"
                                                    label="Dashboard"
                                                    icon={
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                        </svg>
                                                    }
                                                    active={isActive('/dashboard')}
                                                    onClick={() => setDropdownOpen(false)}
                                                />
                                            )}
                                        </div>

                                        {/* Divider + Logout */}
                                        <div className="px-2 pb-2 border-t border-slate-700/60 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer group"
                                            >
                                                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="hidden sm:inline-flex px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation (Scrollable) */}
                <div className="md:hidden overflow-x-auto pb-3 pt-1 hide-scrollbar -mx-4 px-4 border-t border-slate-800 flex gap-2">
                    <MobileNavLink to="/" label="Home" active={isActive('/')} />
                    <MobileNavLink to="/facilities-assets" label="Facilities" active={isActive('/facilities-assets')} />
                    <MobileNavLink to="/about" label="About Us" active={isActive('/about')} />
                    <MobileNavLink to="/contact" label="Contact" active={isActive('/contact')} />
                    <MobileNavLink to="/faq" label="FAQ" active={isActive('/faq')} />
                    {isAuthenticated && (
                        <>
                            {!isPrivilegedUser && <MobileNavLink to="/profile" label="Profile" active={isActive('/profile')} />}
                            {isPrivilegedUser && <MobileNavLink to="/dashboard" label="Dashboard" active={isActive('/dashboard')} />}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

/* ── Reusable Sub-components ──────────────────────────────────────────── */

function NavLink({ to, label, active }) {
    return (
        <Link
            to={to}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all relative group ${active ? 'text-blue-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
        >
            {label}
            {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(59,130,246,0.8)]"></span>
            )}
        </Link>
    );
}

function MobileNavLink({ to, label, active }) {
    return (
        <Link
            to={to}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-all border ${active
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700/50'
                }`}
        >
            {label}
        </Link>
    );
}

function DropdownItem({ to, label, icon, active, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
        >
            <span className={active ? 'text-blue-400' : 'text-slate-500'}>{icon}</span>
            {label}
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
        </Link>
    );
}
