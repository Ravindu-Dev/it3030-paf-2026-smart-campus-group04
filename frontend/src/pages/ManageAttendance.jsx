import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAttendance, getOverallStats } from '../services/attendanceService';

/**
 * ManageAttendance — Admin/Manager page for viewing attendance records.
 *
 * Shows overall stats, a searchable/filterable table of attendance records,
 * and a button to navigate to the QR scanner page.
 */
export default function ManageAttendance({ standalone = false }) {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recordsRes, statsRes] = await Promise.all([
                    getAllAttendance(),
                    getOverallStats(),
                ]);
                setRecords(recordsRes.data.data || []);
                setStats(statsRes.data.data || null);
            } catch (err) {
                console.error('Failed to fetch attendance data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Reset visible count on filter/search
    useEffect(() => {
        setVisibleCount(6);
    }, [searchTerm, filterStatus]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        }) + ' ' + d.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit',
        });
    };

    const filtered = records.filter((r) => {
        const matchesSearch = !searchTerm ||
            r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || r.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const statusColor = (status) => {
        switch (status) {
            case 'PRESENT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'LATE': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'ABSENT': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <div className={standalone ? '' : 'min-h-screen bg-slate-900 py-8 px-4'}>
            <div className={standalone ? '' : 'max-w-7xl mx-auto'}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">📋</span> Attendance Management
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Track and manage campus attendance records</p>
                    </div>
                    <button
                        onClick={() => navigate('/attendance/scan')}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        Scan QR Code
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                        <div className="bg-linear-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5 text-center">
                            <p className="text-3xl font-extrabold text-blue-400">{stats.totalRecords}</p>
                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Total Records</p>
                        </div>
                        <div className="bg-linear-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5 text-center">
                            <p className="text-3xl font-extrabold text-emerald-400">{stats.presentCount}</p>
                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Present</p>
                        </div>
                        <div className="bg-linear-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5 text-center">
                            <p className="text-3xl font-extrabold text-amber-400">{stats.lateCount}</p>
                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Late</p>
                        </div>
                        <div className="bg-linear-to-br from-red-600/20 to-red-600/5 border border-red-500/20 rounded-2xl p-5 text-center">
                            <p className="text-3xl font-extrabold text-red-400">{stats.absentCount}</p>
                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Absent</p>
                        </div>
                        <div className="bg-linear-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5 text-center">
                            <p className={`text-3xl font-extrabold ${stats.attendanceRate >= 75 ? 'text-emerald-400' : stats.attendanceRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                {stats.attendanceRate}%
                            </p>
                            <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Rate</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'PRESENT', 'LATE', 'ABSENT'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        filterStatus === status
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Records Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-14 bg-slate-700/30 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="text-5xl mb-3">📋</span>
                            <p className="text-white font-semibold">No attendance records found</p>
                            <p className="text-slate-500 text-sm mt-1">
                                {searchTerm || filterStatus !== 'ALL'
                                    ? 'Try adjusting your search or filter.'
                                    : 'Start scanning QR codes to record attendance.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Student / Staff</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Marked By</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {filtered.slice(0, visibleCount).map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-700/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-white text-sm font-medium">{record.userName}</p>
                                                <p className="text-slate-500 text-xs">{record.userEmail}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-300 text-sm">{formatDateTime(record.markedAt)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-400 text-sm">{record.markedByName || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-400 text-sm">{record.location || '—'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Results count */}
                    {!isLoading && filtered.length > 0 && (
                        <div className="px-6 py-3 border-t border-slate-700/30 flex items-center justify-between">
                            <span className="text-slate-500 text-xs">
                                Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} records
                            </span>
                        </div>
                    )}

                    {filtered.length > 6 && (
                        <div className="relative pt-10 pb-6 bg-slate-800/40 border-t border-slate-700/30">
                            {visibleCount < filtered.length && (
                                <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-t from-slate-900/80 to-transparent pointer-events-none -translate-y-full" />
                            )}
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-xl shadow-2xl">
                                    {visibleCount < filtered.length ? (
                                        <button 
                                            onClick={() => setVisibleCount(prev => Math.min(prev + 6, filtered.length))}
                                            className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                        >
                                            <span>View More Records</span>
                                            <svg className="w-4 h-4 text-emerald-500 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setVisibleCount(6)}
                                            className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                        >
                                            <span>Collapse List</span>
                                            <svg className="w-4 h-4 text-emerald-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                    )}
                                    <div className="h-4 w-px bg-slate-800 mx-1" />
                                    <div className="px-4 py-1 flex items-center gap-2 font-mono">
                                        <span className="text-white text-xs font-bold">{Math.min(visibleCount, filtered.length)}</span>
                                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-tighter">/</span>
                                        <span className="text-slate-500 text-xs font-medium">{filtered.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
