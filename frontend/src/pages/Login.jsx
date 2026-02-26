import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Login page with Google OAuth Sign-In button.
 *
 * On successful Google authentication:
 * 1. Receives the Google ID token (credential)
 * 2. Sends it to the backend via AuthContext.login()
 * 3. Backend verifies with Google, creates/finds user, returns JWT
 * 4. Redirects to dashboard
 */
export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await login(credentialResponse.credential);
            toast.success('Welcome to Smart Campus!');
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Login failed:', error);
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        }
    };

    const handleGoogleError = () => {
        toast.error('Google Sign-In was unsuccessful. Please try again.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <span className="text-5xl mb-4 block">🏫</span>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Smart Campus <span className="text-blue-400">Hub</span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Sign in with your university Google account to get started.
                        </p>
                    </div>

                    {/* Google Sign-In Button */}
                    <div className="flex justify-center mb-6">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            size="large"
                            width="350"
                            text="signin_with"
                            shape="pill"
                        />
                    </div>

                    {/* Info */}
                    <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-500 text-xs text-center">
                            By signing in, you agree to the Smart Campus Operations Hub terms.
                            Your account will be created automatically on first login.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
