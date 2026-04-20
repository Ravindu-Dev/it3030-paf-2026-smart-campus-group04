import { useState, useEffect, useRef } from 'react';

/**
 * MaintenanceBanner — Sticky top bar shown on user-facing pages
 * when maintenance is scheduled but not yet active.
 *
 * Uses plain fetch to avoid the Axios 503 interceptor.
 */
export default function MaintenanceBanner() {
    const [scheduled, setScheduled] = useState(null); // { startTime, endTime }
    const [countdown, setCountdown] = useState(null); // { hours, mins, secs, totalMs, elapsedPct }
    const statusRef = useRef(null);

    // ─── Poll maintenance status every 60 seconds ──────────────────────
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/maintenance/status');
                if (!res.ok) return;
                const data = await res.json();
                statusRef.current = data;

                // Show banner only when enabled but NOT yet active (scheduled for future)
                if (data.enabled && !data.isActive && data.startTime) {
                    const start = new Date(data.startTime);
                    if (start > new Date()) {
                        setScheduled({ startTime: data.startTime, endTime: data.endTime });
                        return;
                    }
                }
                setScheduled(null); // Hide in all other cases
            } catch {
                // Silent fail
            }
        };

        fetchStatus();
        const poll = setInterval(fetchStatus, 60000);
        return () => clearInterval(poll);
    }, []);

    // ─── Real-time countdown ticker ────────────────────────────────────
    useEffect(() => {
        if (!scheduled?.startTime) {
            setCountdown(null);
            return;
        }

        const start = new Date(scheduled.startTime);
        const now = new Date();
        const totalMs = start - now;
        if (totalMs <= 0) {
            setScheduled(null);
            setCountdown(null);
            return;
        }

        // Reference time for progress bar calculation
        const referenceTotal = totalMs; // capture once

        const tick = () => {
            const remaining = start - new Date();
            if (remaining <= 0) {
                setScheduled(null);
                setCountdown(null);
                return;
            }
            const hours = Math.floor(remaining / 3_600_000);
            const mins = Math.floor((remaining % 3_600_000) / 60_000);
            const secs = Math.floor((remaining % 60_000) / 1_000);
            const elapsed = referenceTotal - remaining;
            const elapsedPct = Math.min(100, (elapsed / referenceTotal) * 100);
            setCountdown({ hours, mins, secs, elapsedPct });
        };

        tick();
        const timer = setInterval(tick, 1_000);
        return () => clearInterval(timer);
    }, [scheduled]);

    if (!countdown) return null;

    const { hours, mins, secs, elapsedPct } = countdown;

    return (
        <div className="fixed top-20 right-4 z-40 w-80 select-none animate-in slide-in-from-right duration-500">
            {/* Main box */}
            <div className="flex flex-col gap-2 p-4 bg-slate-800/90 backdrop-blur-md border border-red-500/30 rounded-2xl shadow-2xl shadow-black/40 text-white">
                <div className="flex items-center gap-2.5 font-bold text-red-400 text-xs uppercase tracking-widest">
                    <svg className="w-4 h-4 shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>System Maintenance</span>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-slate-300 text-sm font-medium">Starting in</p>
                    {/* Countdown digits */}
                    <div className="flex items-center gap-1 font-mono font-black text-lg tabular-nums text-red-500">
                        <span className="bg-red-500/10 rounded-lg px-2 py-0.5 border border-red-500/20">{String(hours).padStart(2, '0')}</span>
                        <span className="opacity-40 text-sm">:</span>
                        <span className="bg-red-500/10 rounded-lg px-2 py-0.5 border border-red-500/20">{String(mins).padStart(2, '0')}</span>
                        <span className="opacity-40 text-sm">:</span>
                        <span className="bg-red-500/10 rounded-lg px-2 py-0.5 border border-red-500/20 text-xs self-end mb-0.5">{String(secs).padStart(2, '0')}</span>
                    </div>
                </div>

                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider text-right">
                    Please save your progress
                </p>

                {/* Progress bar — fills as maintenance start approaches */}
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div
                        className="h-full bg-linear-to-r from-red-600 to-red-400 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        style={{ width: `${elapsedPct}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
