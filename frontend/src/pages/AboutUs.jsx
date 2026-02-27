export default function AboutUs() {
    return (
        <div className="min-h-screen bg-slate-900 pb-24">
            {/* Hero Section */}
            <div className="relative pt-24 pb-20 overflow-hidden border-b border-slate-800/50">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                </div>
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Smart Campus</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 mx-auto leading-relaxed">
                        We are revolutionizing how universities manage their infrastructure, empowering students and staff with intuitive tools for a seamless campus experience.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 mb-20">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-2xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">50+</div>
                            <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Facilities</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">10k+</div>
                            <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Users</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
                            <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Support</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">99%</div>
                            <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vision & Mission */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Mission */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700 rounded-3xl p-10 hover:border-blue-500/30 transition-colors group">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            To eliminate administrative friction from university life by providing a unified, secure, and delightfully easy-to-use platform for all campus operations.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900 border border-slate-700 rounded-3xl p-10 hover:border-purple-500/30 transition-colors group">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            We envision a world where educational institutions can focus entirely on innovation and learning, rather than being bogged down by operational inefficiencies.
                        </p>
                    </div>
                </div>
            </div>

            {/* Team/Story Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-6">Built for the future of education</h2>
                <p className="text-slate-400 leading-relaxed mb-8">
                    The Smart Campus Operations Hub was developed by a team of passionate engineers and educators who recognized the need for a modern approach to university infrastructure management. Built on robust technologies and designed with user-centric principles, our platform scales with your institution's needs.
                </p>
            </div>
        </div>
    );
}
