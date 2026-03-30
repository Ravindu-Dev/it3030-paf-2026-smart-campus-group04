import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import hero1 from '../assets/hero/hero1.png';
import hero2 from '../assets/hero/hero2.png';
import hero3 from '../assets/hero/hero3.png';

const heroImages = [hero1, hero2, hero3];
const heroHeadlines = [
    'Smart Infrastructure',
    'Seamless Learning',
    'Connected Campus',
];
const heroSublines = [
    'Modern facilities at your fingertips',
    'Technology-enabled study environments',
    'A unified digital ecosystem',
];

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [currentImage, setCurrentImage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentImage((prev) => (prev + 1) % heroImages.length);
                setIsTransitioning(false);
            }, 600);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 selection:bg-blue-500/30">
            {/* ─── Hero Section ─────────────────────────────────────────── */}
            <div className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden">
                {/* Background Images with Crossfade */}
                {heroImages.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-all duration-[1200ms] ease-in-out ${index === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`}
                        style={{
                            backgroundImage: `url(${src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                ))}

                {/* Multi-layer overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950 z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60 z-[1]" />

                {/* Animated accent orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
                    <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 left-[10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 z-[2] opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32 pb-20 sm:pt-40 sm:pb-24">
                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] text-blue-300 text-sm font-medium mb-10 transition-all duration-500 ${isTransitioning ? 'opacity-60' : 'opacity-100'}`}>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                        Smart Campus<span className="text-blue-400 font-bold">.</span> Operations 2.0 is Live
                    </div>

                    {/* Main heading */}
                    <h1 className={`text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold text-white tracking-tight mb-8 leading-[1.08] transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
                        The Operating System <br className="hidden sm:block" />
                        for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400">Campus</span>
                    </h1>

                    {/* Image caption that changes */}
                    <div className={`mb-4 transition-all duration-500 ${isTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                        <span className="text-blue-400 font-bold text-lg tracking-wide">{heroHeadlines[currentImage]}</span>
                        <span className="text-slate-400 text-lg ml-2">— {heroSublines[currentImage]}</span>
                    </div>

                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300/90 leading-relaxed mb-14">
                        A unified, premium platform to seamlessly manage resources, track maintenance, organize events, and simplify daily operations.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <Link
                                to="/profile"
                                className="group inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-lg font-semibold transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:-translate-y-1"
                            >
                                My Account
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="group inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-lg font-semibold transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:-translate-y-1"
                                >
                                    Get Started Free
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                                <Link
                                    to="/facilities-assets"
                                    className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-white/[0.06] backdrop-blur-xl hover:bg-white/[0.1] text-white border border-white/[0.1] hover:border-white/[0.2] rounded-2xl text-lg font-semibold transition-all duration-300 hover:-translate-y-1"
                                >
                                    Explore Facilities
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Image indicator dots */}
                    <div className="flex items-center justify-center gap-2.5 mt-14">
                        {heroImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setIsTransitioning(true); setTimeout(() => { setCurrentImage(i); setIsTransitioning(false); }, 400); }}
                                className={`transition-all duration-500 rounded-full cursor-pointer ${i === currentImage
                                    ? 'w-8 h-2.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                                    : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                                    }`}
                                aria-label={`Show image ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom fade into next section */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-[3]" />
            </div>

            {/* ─── Features Section ─────────────────────────────────────── */}
            <div className="py-32 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/[0.04] rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <span className="text-blue-400 text-sm font-bold uppercase tracking-[0.2em] mb-4 block">Platform</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                            Everything you need to{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">run your campus</span>
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Powerful modules integrated into one delightful experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Feature Card 1 */}
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
                            title="Resource Booking"
                            description="Book lecture halls, labs, projectors, and equipment instantly. Avoid double-bookings with our intelligent scheduling engine."
                            color="blue"
                        />

                        {/* Feature Card 2 */}
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H21M3 21h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" /></svg>}
                            title="Maintenance Ticketing"
                            description="Report issues instantly. Track repairs from request to resolution with our role-based technician and manager dashboards."
                            color="purple"
                        />

                        {/* Feature Card 3 */}
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>}
                            title="Secure Access"
                            description="Built with enterprise-grade security. Single Sign-On (SSO) with your university Google account for frictionless access."
                            color="emerald"
                        />
                    </div>

                    {/* Extended feature cards row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>}
                            title="Campus Navigation"
                            description="Interactive campus maps with real-time transport tracking. Navigate facilities, find buildings, and track shuttle routes effortlessly."
                            color="amber"
                        />
                        <FeatureCard
                            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>}
                            title="Event Management"
                            description="Discover campus events, register for activities, and manage your calendar — all from one centralized platform."
                            color="rose"
                        />
                    </div>
                </div>
            </div>

            {/* ─── Bottom CTA ──────────────────────────────────────────── */}
            <div className="py-32 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/[0.08] rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="text-blue-400 text-sm font-bold uppercase tracking-[0.2em] mb-4 block">Get Started</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Ready to transform <br className="hidden sm:block" />your campus?
                    </h2>
                    <p className="text-xl text-slate-300/80 mb-14 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of students, faculty, and staff experiencing a smarter way to manage campus life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="group inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xl font-bold transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:-translate-y-1"
                                >
                                    Go to Dashboard
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                                <Link
                                    to="/facilities-assets"
                                    className="inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-white/[0.06] backdrop-blur-xl hover:bg-white/[0.1] text-white border border-white/[0.1] hover:border-white/[0.2] rounded-2xl text-xl font-bold transition-all duration-300 hover:-translate-y-1"
                                >
                                    Explore Facilities
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="group inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xl font-bold transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:-translate-y-1"
                                >
                                    Sign In Now
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </Link>
                                <Link
                                    to="/about"
                                    className="inline-flex items-center justify-center gap-2.5 px-10 py-5 bg-white/[0.06] backdrop-blur-xl hover:bg-white/[0.1] text-white border border-white/[0.1] hover:border-white/[0.2] rounded-2xl text-xl font-bold transition-all duration-300 hover:-translate-y-1"
                                >
                                    Learn More
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Feature Card Component ──────────────────────────────────────── */
function FeatureCard({ icon, title, description, color }) {
    const colorMap = {
        blue: {
            iconBg: 'bg-blue-500/10 border-blue-500/20',
            iconText: 'text-blue-400',
            hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)]',
            hoverBorder: 'hover:border-blue-500/30',
        },
        purple: {
            iconBg: 'bg-purple-500/10 border-purple-500/20',
            iconText: 'text-purple-400',
            hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.15)]',
            hoverBorder: 'hover:border-purple-500/30',
        },
        emerald: {
            iconBg: 'bg-emerald-500/10 border-emerald-500/20',
            iconText: 'text-emerald-400',
            hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)]',
            hoverBorder: 'hover:border-emerald-500/30',
        },
        amber: {
            iconBg: 'bg-amber-500/10 border-amber-500/20',
            iconText: 'text-amber-400',
            hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.15)]',
            hoverBorder: 'hover:border-amber-500/30',
        },
        rose: {
            iconBg: 'bg-rose-500/10 border-rose-500/20',
            iconText: 'text-rose-400',
            hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(244,63,94,0.15)]',
            hoverBorder: 'hover:border-rose-500/30',
        },
    };

    const c = colorMap[color] || colorMap.blue;

    return (
        <div className={`group bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-8 lg:p-10 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-2 ${c.hoverShadow} ${c.hoverBorder}`}>
            <div className={`w-14 h-14 ${c.iconBg} border rounded-2xl flex items-center justify-center mb-7 ${c.iconText} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed text-[15px]">
                {description}
            </p>
        </div>
    );
}
