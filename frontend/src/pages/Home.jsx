import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import hero1 from '../assets/hero/hero1.png';
import hero2 from '../assets/hero/hero2.png';
import hero3 from '../assets/hero/hero3.png';

const heroImages = [hero1, hero2, hero3];

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % heroImages.length);
        }, 5000); // 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 selection:bg-blue-500/30">
            {/* Hero Section */}
            <div className="relative min-h-[100vh] flex flex-col justify-center pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden border-b border-slate-800/50">
                {/* Auto-Switching Background Images */}
                {heroImages.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentImage ? 'opacity-100' : 'opacity-0'
                            }`}
                        style={{
                            backgroundImage: `url(${src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    ></div>
                ))}

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-slate-900/60 sm:bg-slate-900/40 z-0"></div>

                {/* Background Decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 right-0 lg:-right-40 w-[40rem] h-[40rem] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen"></div>
                    <div className="absolute -bottom-40 left-0 lg:-left-40 w-[40rem] h-[40rem] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen"></div>
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01OS41IDBoLjV2NjBIMTB6IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-10"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 pt-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 text-blue-300 text-sm font-medium mb-8 hover:bg-slate-800/80 transition-colors cursor-default shadow-xl shadow-black/20">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        Smart Campus Operations 2.0 is Live
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight mb-8 leading-tight drop-shadow-2xl">
                        The Operating System <br className="hidden sm:block" />
                        for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 drop-shadow-lg">Campus</span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-200 leading-relaxed mb-12 drop-shadow-md">
                        A unified, premium platform to seamlessly manage resources, track maintenance, organize events, and simplify daily operations.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        {isAuthenticated ? (
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-500/50 text-white rounded-xl text-lg font-medium transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-1"
                            >
                                My Account
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 border border-blue-500/50 text-white rounded-xl text-lg font-bold transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-1"
                                >
                                    Get Started Free
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                                <Link
                                    to="/facilities-assets"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800/80 text-white border border-slate-700 rounded-xl text-lg font-bold transition-all hover:-translate-y-1 shadow-lg shadow-black/20"
                                >
                                    Explore Facilities
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Preview Section */}
            <div className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900 pointer-events-none z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Everything you need to run your campus</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">Powerful modules integrated into one delightful experience.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)] hover:border-blue-500/30 group">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                <span className="text-4xl">🗓️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Resource Booking</h3>
                            <p className="text-slate-400 hover:text-slate-300 transition-colors leading-relaxed text-lg">
                                Book lecture halls, labs, projectors, and equipment instantly. Avoid double-bookings with our intelligent scheduling engine.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.2)] hover:border-purple-500/30 group">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl flex items-center justify-center mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                <span className="text-4xl">🔧</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Maintenance Ticketing</h3>
                            <p className="text-slate-400 hover:text-slate-300 transition-colors leading-relaxed text-lg">
                                Report issues instantly. Track repairs from request to resolution with our role-based technician and manager dashboards.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.2)] hover:border-emerald-500/30 group">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <span className="text-4xl">🔐</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Secure Access</h3>
                            <p className="text-slate-400 hover:text-slate-300 transition-colors leading-relaxed text-lg">
                                Built with enterprise-grade security. Single Sign-On (SSO) with your university Google account for frictionless access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="py-32 border-t border-slate-800/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-blue-900/40 pointer-events-none z-0"></div>
                <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] z-0"></div>
                <div className="absolute bottom-0 left-1/4 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-[100px] z-0"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Ready to transform your campus?</h2>
                    <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">Join thousands of students, faculty, and staff experiencing a smarter way to manage campus life.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-10 py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xl font-bold transition-all duration-300 shadow-xl shadow-white/10 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1"
                    >
                        Sign In Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
