import { Link } from 'react-router-dom';

/**
 * 403 Forbidden page.
 * Displayed when a user tries to access a route they don't have permission for.
 */
export default function Forbidden() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-red-400">403</h1>
                <h2 className="text-2xl font-semibold text-white mt-4">Access Denied</h2>
                <p className="text-slate-400 mt-2 max-w-md mx-auto">
                    You don't have permission to access this page. Contact your administrator if you believe this is an error.
                </p>
                <div className="flex gap-4 justify-center mt-8">
                    <Link
                        to="/dashboard"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
