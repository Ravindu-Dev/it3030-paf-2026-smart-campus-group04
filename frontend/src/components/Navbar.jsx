import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar component — auth-aware navigation bar.
 *
 * Shows:
 * - "Login" button when not authenticated
 * - User avatar, name, "Admin" link (if ADMIN), and "Logout" button when authenticated
 */
export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-2xl">🏫</span>
                        <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            Smart Campus
                        </span>
                    </Link>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* Dashboard link */}
                                <Link
                                    to="/dashboard"
                                    className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>

                                {/* Admin link — only visible to ADMIN role */}
                                {user?.role === 'ADMIN' && (
                                    <Link
                                        to="/admin/users"
                                        className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}

                                {/* User Profile */}
                                <Link to="/profile" className="flex items-center gap-2 group">
                                    {user?.profilePicture ? (
                                        <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full border-2 border-slate-600 group-hover:border-blue-400 transition-colors"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    )}
                                    <span className="text-slate-300 group-hover:text-white text-sm font-medium transition-colors hidden sm:inline">
                                        {user?.name}
                                    </span>
                                </Link>

                                {/* Logout */}
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
