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
                            <>
                                {/* Quick Dashboard access for larger screens */}
                                <Link
                                    to="/dashboard"
                                    className="hidden sm:inline-flex px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors border border-slate-700"
                                >
                                    Dashboard
                                </Link>

                                {/* Divider */}
                                <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>

                                {/* User Profile */}
                                <Link
                                    to="/profile"
                                    className={`flex items-center gap-3 px-2 py-1.5 rounded-xl transition-all ${isActive('/profile')
                                        ? 'bg-slate-800 border border-slate-700'
                                        : 'hover:bg-slate-800/50 border border-transparent'
                                        }`}
                                >
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full border-2 border-slate-600 object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-blue-500/30">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <div className="hidden sm:block text-left">
                                        <span className="text-white text-sm font-medium block leading-none mb-1">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                        <span className="text-blue-400 text-[10px] font-bold tracking-wider uppercase leading-none block">
                                            {user?.role}
                                        </span>
                                    </div>
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer group"
                                    title="Logout"
                                >
                                    <svg className="group-hover:translate-x-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </button>
                            </>
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
                </div>
            </div>
        </nav>
    );
}

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
