import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — Premium auth-aware navigation bar for the Smart Campus Hub.
 */
export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo / Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                            <span className="text-white text-lg font-bold">S</span>
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                                Smart Campus
                            </span>
                            <span className="text-[10px] text-slate-500 block -mt-0.5 font-medium tracking-wider uppercase">
                                Operations Hub
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-1">
                        {isAuthenticated ? (
                            <>
                                {/* Nav Links */}
                                <NavLink to="/dashboard" label="Dashboard" active={isActive('/dashboard')} />
                                <NavLink to="/facilities" label="Facilities" active={isActive('/facilities')} />
                                {user?.role !== 'ADMIN' && (
                                    <NavLink to="/bookings" label="My Bookings" active={isActive('/bookings')} />
                                )}

                                {user?.role === 'ADMIN' && (
                                    <>
                                        <NavLink to="/admin/facilities" label="Manage Facilities" active={isActive('/admin/facilities')} />
                                        <NavLink to="/admin/bookings" label="Manage Bookings" active={isActive('/admin/bookings')} />
                                        <NavLink to="/admin/users" label="Users" active={isActive('/admin/users')} />
                                    </>
                                )}

                                {/* Divider */}
                                <div className="w-px h-6 bg-slate-700 mx-2 hidden sm:block"></div>

                                {/* User Profile */}
                                <Link
                                    to="/profile"
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all ${isActive('/profile')
                                        ? 'bg-slate-700/80'
                                        : 'hover:bg-slate-700/40'
                                        }`}
                                >
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-full border-2 border-slate-600"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div className="hidden sm:block">
                                        <span className="text-white text-sm font-medium block leading-tight">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                        <span className="text-slate-500 text-[10px] font-medium leading-tight">
                                            {user?.role}
                                        </span>
                                    </div>
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="ml-1 p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all cursor-pointer"
                                    title="Logout"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ to, label, active }) {
    return (
        <Link
            to={to}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${active
                ? 'bg-slate-700/80 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
                }`}
        >
            {label}
        </Link>
    );
}
