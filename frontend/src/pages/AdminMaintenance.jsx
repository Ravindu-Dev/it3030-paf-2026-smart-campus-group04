import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

/**
 * Admin Maintenance Page — Control center for system-wide downtime.
 */
export default function AdminMaintenance({ standalone = false }) {
    const [status, setStatus] = useState({ isActive: false, enabled: false, startTime: '', endTime: '' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Form state
    const [form, setForm] = useState({
        startTime: '',
        endTime: ''
    });

    const fetchStatus = async () => {
        try {
            const response = await api.get('/maintenance/status');
            const data = response.data;
            setStatus(data);
            
            // Format dates for input (YYYY-MM-DDTHH:mm)
            if (data.startTime) {
                setForm(prev => ({
                    ...prev,
                    startTime: data.startTime.substring(0, 16),
                    endTime: data.endTime ? data.endTime.substring(0, 16) : ''
                }));
            }
        } catch (err) {
            toast.error("Failed to fetch maintenance status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleEnable = async () => {
        if (!form.startTime || !form.endTime) {
            toast.error("Please set both start and end times");
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/maintenance/enable', {
                startTime: form.startTime + ':00', // Java LocalDateTime.parse needs seconds
                endTime: form.endTime + ':00'
            });
            toast.success("Maintenance scheduled successfully");
            fetchStatus();
        } catch (err) {
            toast.error("Failed to enable maintenance");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnableNow = async () => {
        setActionLoading(true);
        try {
            await api.post('/maintenance/enable-now');
            toast.success('Maintenance enabled immediately!');
            fetchStatus();
        } catch (err) {
            toast.error('Failed to enable maintenance');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDisable = async () => {
        setActionLoading(true);
        try {
            await api.post('/maintenance/disable');
            toast.success("Maintenance disabled");
            fetchStatus();
        } catch (err) {
            toast.error("Failed to disable maintenance");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${!standalone ? 'max-w-3xl' : ''}`}>
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">System Maintenance</h1>
                <p className="text-slate-400 mt-1">Control system-wide downtime and schedule maintenance windows.</p>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl border ${status.isActive ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'} transition-colors`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.isActive ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                {status.isActive ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Current Status</p>
                            <h2 className={`text-2xl font-bold ${status.isActive ? 'text-red-400' : 'text-emerald-400'}`}>
                                {status.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </h2>
                        </div>
                    </div>
                    {status.isActive && (
                        <div className="hidden sm:block px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse">
                            SYSTEM OFF-LINE
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Immediate toggle */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                        <h3 className="text-white font-semibold">Immediate Control</h3>
                        <p className="text-slate-500 text-sm mt-1">Turn maintenance on or off right now without scheduling.</p>
                    </div>
                    <div className="flex flex-col gap-3 mt-auto">
                        <button
                            id="enable-now-btn"
                            onClick={handleEnableNow}
                            disabled={actionLoading || status.isActive}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${
                                status.isActive
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 hover:-translate-y-0.5'
                            }`}
                        >
                            🔴 {actionLoading ? 'Processing...' : 'Enable Now'}
                        </button>
                        <button
                            id="disable-maintenance-btn"
                            onClick={handleDisable}
                            disabled={actionLoading || !status.enabled}
                            className={`w-full py-3 rounded-xl font-bold transition-all border ${
                                status.enabled
                                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-lg hover:-translate-y-0.5'
                                    : 'border-slate-800 text-slate-700 cursor-not-allowed'
                            }`}
                        >
                            ✅ Turn Off Maintenance
                        </button>
                    </div>
                </div>

                {/* Schedule maintenance */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                        <h3 className="text-white font-semibold">Schedule Window</h3>
                        <p className="text-slate-500 text-sm mt-1">Set a future time — a warning banner will show on user pages.</p>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">Start Time</label>
                            <input
                                type="datetime-local"
                                value={form.startTime}
                                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">End Time</label>
                            <input
                                type="datetime-local"
                                value={form.endTime}
                                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            />
                        </div>
                    </div>
                    <button
                        id="schedule-enable-btn"
                        onClick={handleEnable}
                        disabled={actionLoading || status.isActive}
                        className={`w-full py-3 rounded-xl font-bold transition-all mt-auto ${
                            status.isActive
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-lg shadow-amber-500/10 hover:-translate-y-0.5'
                        }`}
                    >
                        🗓️ {actionLoading ? 'Processing...' : 'Schedule & Enable'}
                    </button>
                </div>
            </div>

            {/* Information Alert */}
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <div className="text-sm text-blue-300">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                        <li>Admins can ALWAYS bypass maintenance and access the dashboard.</li>
                        <li>Standard users will be blocked and redirected to a splash page.</li>
                        <li>Maintenance is active ONLY if <span className="font-bold underline">Enabled</span> is set AND the current time falls within the window.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
