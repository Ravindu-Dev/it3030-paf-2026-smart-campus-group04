export default function AboutUs() {
    return (
        <div className="min-h-screen bg-slate-900 pb-24 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header / Hero */}
            <div className="pt-32 pb-20 text-center px-4 sm:px-6 lg:px-8 relative z-10 border-b border-slate-800/50 mb-16">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                    About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Smart Campus</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto drop-shadow-md leading-relaxed">
                    We are revolutionizing how universities manage their infrastructure, empowering students and staff with intuitive tools for a seamless campus experience.
                </p>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-24">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-blue-500/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div className="group">
                            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-blue-600 mb-2 group-hover:scale-110 transition-transform">50+</div>
                            <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Facilities</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 mb-2 group-hover:scale-110 transition-transform">10k+</div>
                            <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Users</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600 mb-2 group-hover:scale-110 transition-transform">24/7</div>
                            <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Support</div>
                        </div>
                        <div className="group">
                            <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-amber-600 mb-2 group-hover:scale-110 transition-transform">99%</div>
                            <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision & Mission */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 relative z-10">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Mission */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:border-blue-500/30 group">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed text-lg">
                            To eliminate administrative friction from university life by providing a unified, secure, and delightfully easy-to-use platform for all campus operations.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-3 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)] hover:border-purple-500/30 group">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
                        <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed text-lg">
                            We envision a world where educational institutions can focus entirely on innovation and learning, rather than being bogged down by operational inefficiencies.
                        </p>
                    </div>
                </div>
            </div>

            {/* Team/Story Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-12 rounded-3xl shadow-xl">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">Built for the future of education</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                    The Smart Campus Operations Hub was developed by a team of passionate engineers and educators who recognized the need for a modern approach to university infrastructure management. Built on robust technologies and designed with user-centric principles, our platform scales with your institution's needs.
                </p>
            </div>
        </div>
    );
}
