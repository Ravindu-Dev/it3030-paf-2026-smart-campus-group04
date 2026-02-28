import Facilities from './Facilities';

export default function PublicFacilities() {
    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            {/* Hero Section */}
            <div className="relative pt-24 pb-20 overflow-hidden border-b border-slate-800/50">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-6">
                        <svg className="text-blue-400 w-8 h-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.4V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-10.4" /><path d="M22 10.2 12 2 2 10.2" /></svg>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
                        Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Facilities & Assets</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Explore our state-of-the-art lecture halls, laboratories, meeting spaces, and equipment available across the campus.
                    </p>
                </div>
            </div>

            {/* Embedded Facilities Component */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
                    <Facilities standalone={true} />
                </div>
            </div>
        </div>
    );
}
