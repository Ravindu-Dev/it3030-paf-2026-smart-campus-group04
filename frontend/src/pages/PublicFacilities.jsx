import Facilities from './Facilities';

export default function PublicFacilities() {
    return (
        <div className="min-h-screen bg-slate-900 pb-20 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header / Hero */}
            <div className="pt-32 pb-24 text-center px-4 sm:px-6 lg:px-8 relative z-10 border-b border-slate-800/50 mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-2xl mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <svg className="text-blue-400 w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.4V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-10.4" /><path d="M22 10.2 12 2 2 10.2" /></svg>
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-8 drop-shadow-lg">
                    Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Facilities & Assets</span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                    Explore our state-of-the-art lecture halls, laboratories, meeting spaces, and equipment available across the campus.
                </p>
            </div>

            {/* Embedded Facilities Component */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <Facilities standalone={true} />
                </div>
            </div>
        </div>
    );
}
