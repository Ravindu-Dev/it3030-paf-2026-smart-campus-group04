import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAttendance, getOverallStats } from '../services/attendanceService';

const Icons = {
    records: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    present: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    late: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    absent: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    rate: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    scan: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
    ),
    search: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    )
};

export default function ManageAttendance({ standalone = false }) {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');
    const [visibleCount, setVisibleCount] = useState(8);

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

    useEffect(() => {
        setVisibleCount(8);
    }, [searchTerm, filterStatus, filterDate]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }) + ' at ' + d.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    const filtered = records.filter((r) => {
        const matchesSearch = !searchTerm ||
            r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
        
        // Date filtering - Compare using local date to match date picker value
        let matchesDate = true;
        if (filterDate && r.markedAt) {
            const d = new Date(r.markedAt);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localRecordDate = `${year}-${month}-${day}`;
            matchesDate = localRecordDate === filterDate;
        }
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'PRESENT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'LATE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'ABSENT': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className={standalone ? '' : 'min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8'}>
            <div className={standalone ? '' : 'max-w-7xl mx-auto'}>
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <span className="p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">📋</span>
                            Attendance <span className="text-blue-500">Management</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Monitor and track campus-wide attendance records in real-time.</p>
                    </div>
                    
                    <button
                        onClick={() => navigate('/attendance/scan')}
                        className="group flex items-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-blue-900/20 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    >
                        {Icons.scan}
                        <span>Scan New Attendance</span>
                    </button>
                </div>

                {/* Stats Grid */}
                {(() => {
                    // Calculate dynamic stats from filtered records
                    const totalFiltered = filtered.length;
                    const presentFiltered = filtered.filter(r => r.status === 'PRESENT').length;
                    const lateFiltered = filtered.filter(r => r.status === 'LATE').length;
                    const absentFiltered = filtered.filter(r => r.status === 'ABSENT').length;
                    const rateFiltered = totalFiltered > 0 ? Math.round((presentFiltered / totalFiltered) * 100) : 0;

                    return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <StatCard icon={Icons.records} label="Filtered Records" value={totalFiltered} color="blue" />
                            <StatCard icon={Icons.present} label="Present" value={presentFiltered} color="emerald" />
                            <StatCard icon={Icons.late} label="Late" value={lateFiltered} color="amber" />
                            <StatCard icon={Icons.absent} label="Absent" value={absentFiltered} color="red" />
                            <StatCard 
                                icon={Icons.rate} 
                                label="Attendance Rate" 
                                value={`${rateFiltered}%`} 
                                color={rateFiltered >= 75 ? 'emerald' : rateFiltered >= 50 ? 'amber' : 'red'} 
                            />
                        </div>
                    );
                })()}

                {/* Filters & Search Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-5 mb-8">
                    <div className="flex flex-col lg:flex-row gap-5 items-center">
                        <div className="w-full lg:flex-1 relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                {Icons.search}
                            </div>
                            <input
                                type="text"
                                placeholder="Search by student name or email address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-[15px] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all opacity-100"
                            />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:flex-none min-w-[160px]">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                                    {Icons.calendar}
                                </div>
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-slate-800/60 rounded-2xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none scheme-dark cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/60 flex-1 lg:flex-none">
                                {['ALL', 'PRESENT', 'LATE', 'ABSENT'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                                            filterStatus === status
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 bg-slate-800/40 rounded-2xl animate-pulse border border-slate-700/20" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/30">
                                <span className="text-5xl">🔍</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No records found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                                {searchTerm || filterStatus !== 'ALL'
                                    ? "We couldn't find any results matching your current filters. Try broadening your search."
                                    : "There are no attendance records in the system yet. Start scanning QR codes to see data here."
                                }
                            </p>
                            {(searchTerm || filterStatus !== 'ALL' || filterDate) && (
                                <button 
                                    onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); setFilterDate(''); }}
                                    className="mt-6 text-blue-400 font-bold hover:text-blue-300 transition-colors text-sm cursor-pointer"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/40 border-b border-slate-800/60">
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">User Information</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Attendance Status</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Timestamp</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Verified By</th>
                                        <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {filtered.slice(0, visibleCount).map((record) => (
                                        <tr key={record.id} className="hover:bg-slate-800/30 transition-all duration-200 group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                                                        {record.userName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-white text-[15px] font-bold group-hover:text-blue-400 transition-colors truncate">{record.userName}</p>
                                                        <p className="text-slate-500 text-xs truncate mt-0.5">{record.userEmail}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border ${getStatusStyles(record.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        record.status === 'PRESENT' ? 'bg-emerald-400' : 
                                                        record.status === 'LATE' ? 'bg-amber-400' : 'bg-red-400'
                                                    }`} />
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-slate-300 text-sm font-medium">{formatDateTime(record.markedAt).split(' at ')[0]}</p>
                                                <p className="text-slate-500 text-[11px] mt-0.5">{formatDateTime(record.markedAt).split(' at ')[1]}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                                    <span className="text-slate-400 text-sm font-medium">{record.markedByName || 'System Auto'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right lg:text-left">
                                                <span className="text-slate-400 text-sm italic font-medium bg-slate-950/40 px-3 py-1 rounded-lg border border-slate-800/40">{record.location || 'Campus Hub'}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination / Results Summary */}
                    {!isLoading && filtered.length > 0 && (
                        <div className="px-8 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-950/20">
                            <p className="text-slate-500 text-[13px] font-medium order-2 sm:order-1">
                                Showing <span className="text-slate-300 font-bold">{Math.min(visibleCount, filtered.length)}</span> of <span className="text-slate-300 font-bold">{filtered.length}</span> campus records
                            </p>
                            
                            {filtered.length > 8 && (
                                <div className="flex items-center gap-2 order-1 sm:order-2">
                                    {visibleCount < filtered.length ? (
                                        <button 
                                            onClick={() => setVisibleCount(prev => Math.min(prev + 8, filtered.length))}
                                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700/50 active:scale-95 cursor-pointer flex items-center gap-2"
                                        >
                                            Load More Results
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setVisibleCount(8)}
                                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700/50 active:scale-95 cursor-pointer flex items-center gap-2"
                                        >
                                            Show Less
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Reusable StatCard Component ───────────────────────────────────── */
function StatCard({ icon, label, value, color }) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-indigo-500/5 border-blue-500/20 text-blue-400 icon-bg:bg-blue-500/10',
        emerald: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-400 icon-bg:bg-emerald-500/10',
        amber: 'from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-400 icon-bg:bg-amber-500/10',
        red: 'from-red-500/20 to-rose-500/5 border-red-500/20 text-red-400 icon-bg:bg-red-500/10'
    };

    const currentStyles = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`relative overflow-hidden bg-linear-to-br ${currentStyles} border rounded-3xl p-6 group transition-all duration-300 hover:shadow-2xl hover:shadow-black/20`}>
            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="relative flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    color === 'blue' ? 'bg-blue-500/10' :
                    color === 'emerald' ? 'bg-emerald-500/10' :
                    color === 'amber' ? 'bg-amber-500/10' : 'bg-red-500/10'
                }`}>
                    {icon}
                </div>
                <div>
                    <p className="text-4xl font-black text-white tracking-tight leading-none mb-1">{value}</p>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.1em]">{label}</p>
                </div>
            </div>
        </div>
    );
}
