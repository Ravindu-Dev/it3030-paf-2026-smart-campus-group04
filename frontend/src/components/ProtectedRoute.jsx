import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route wrapper component.
 *
 * Checks if the user is authenticated before rendering children.
 * Optionally restricts access to specific roles.
 *
 * Usage:
 *   <Route path="/dashboard" element={
 *     <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   } />
 *
 *   <Route path="/admin/users" element={
 *     <ProtectedRoute allowedRoles={['ADMIN']}>
 *       <AdminUsers />
 *     </ProtectedRoute>
 *   } />
 */
export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Show loading spinner while checking auth state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role check — if allowedRoles is specified, verify the user's role
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
