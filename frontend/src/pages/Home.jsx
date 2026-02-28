import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-slate-900 selection:bg-blue-500/30">
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden border-b border-slate-800/50">
                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01OS41IDBoLjV2NjBIMTB6IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-30"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 hover:bg-blue-500/20 transition-colors cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Smart Campus Operations 2.0 is Live
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                        The Operating System <br className="hidden sm:block" />
                        for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Campus</span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-10">
                        A unified, premium platform to seamlessly manage resources, track maintenance, organize events, and simplify daily operations.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-lg font-medium transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-1"
                            >
                                My Account
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-lg font-medium transition-all shadow-xl shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-1"
                                >
                                    Get Started Free
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                                <Link
                                    to="/facilities-assets"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-black/20"
                                >
                                    Explore Facilities
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Preview Section */}
            <div className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need to run your campus</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Powerful modules integrated into one delightful experience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 hover:bg-slate-800/80 transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500/30 group">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-3xl">🗓️</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Resource Booking</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Book lecture halls, labs, projectors, and equipment instantly. Avoid double-bookings with our intelligent scheduling engine.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 hover:bg-slate-800/80 transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-purple-500/30 group">
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-3xl">🔧</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Maintenance Ticketing</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Report issues instantly. Track repairs from request to resolution with our role-based technician and manager dashboards.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 hover:bg-slate-800/80 transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-500/30 group">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-3xl">🔐</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Secure Access</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Built with enterprise-grade security. Single Sign-On (SSO) with your university Google account for frictionless access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="py-24 border-t border-slate-800/50 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to transform your campus?</h2>
                    <p className="text-xl text-slate-400 mb-10">Join thousands of students, faculty, and staff experiencing a smarter way to manage campus life.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-lg font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        Sign In Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
