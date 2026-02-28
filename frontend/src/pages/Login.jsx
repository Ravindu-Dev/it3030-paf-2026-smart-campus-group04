import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Premium Login page with Google OAuth Sign-In.
 */
export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to home
    if (isAuthenticated) {
        navigate('/', { replace: true });
        return null;
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const { user } = await login(credentialResponse.credential);
            toast.success('Welcome to Smart Campus!');

            // Redirect based on role
            const isPrivileged = ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(user?.role);
            navigate(isPrivileged ? '/dashboard' : '/', { replace: true });
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
        <div className="min-h-[85vh] flex items-center justify-center bg-slate-900 relative overflow-hidden">
            {/* Animated Background Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 animate-pulse"></div>
                <div className="absolute top-1/2 right-1/4 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-lg px-4 relative z-10">
                {/* Glassmorphism Card */}
                <div className="bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-10 sm:p-12 shadow-2xl relative overflow-hidden group">

                    {/* Inner Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-70"></div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-white text-4xl font-bold">S</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                            Welcome Back
                        </h1>
                        <p className="text-slate-400 text-base leading-relaxed">
                            Sign in with your university Google account to access your personalized campus dashboard.
                        </p>
                    </div>

                    {/* Google Sign-In Area */}
                    <div className="flex flex-col items-center mb-8 p-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            size="large"
                            width="310"
                            text="signin_with"
                            shape="circle"
                        />
                    </div>

                    {/* Footer Info */}
                    <div className="border-t border-slate-700/50 pt-6 mt-4">
                        <p className="text-slate-500 text-xs text-center leading-relaxed">
                            By continuing, you agree to the Smart Campus Hub <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
