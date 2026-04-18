import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Maintenance Page — Public splash screen shown when system is down.
 * Uses plain fetch (not the Axios api instance) to avoid the 503 interceptor
 * triggering a redirect loop from within the maintenance page itself.
 */
export default function Maintenance() {
    const [status, setStatus] = useState(null);
    const navigate = useNavigate();

    // Polling logic to check if system is back online
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('/api/maintenance/status');
                if (!response.ok) return; // Silent fail — keep showing maintenance page
                const data = await response.json();
                setStatus(data);
                if (!data.isActive) {
                    navigate('/'); // Redirect home when maintenance ends
                }
            } catch (err) {
                // Network error — silently wait for next poll
                console.error('Maintenance status check failed', err);
            }
        };

        const interval = setInterval(checkStatus, 30000); // Poll every 30 seconds
        checkStatus(); // Check immediately on mount

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 max-w-2xl w-full">
                {/* Construction Icon */}
                <div className="mb-12 relative flex justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/20 rotate-12 animate-bounce">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6">
                    🚧 System Undergoing <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-400">Maintenance</span>
                </h1>
                
                <p className="text-slate-400 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed mb-12">
                    We're improving your experience. The hub will be back online shortly. 
                    Thank you for your patience!
                </p>

                {/* Progress Indicators */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md">
                        <div className="w-5 h-5 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                        </div>
                        <span className="text-slate-300 font-semibold text-sm animate-pulse tracking-wide">POLLING SYSTEM STATUS...</span>
                    </div>

                    <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em] animate-pulse">
                        Auto-Recovery Enabled
                    </p>
                </div>
                
            </div>
        </div>
    );
}
