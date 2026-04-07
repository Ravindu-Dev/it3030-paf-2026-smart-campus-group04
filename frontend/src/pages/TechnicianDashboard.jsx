import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTechnicianTickets, updateTicketStatus } from '../services/ticketService';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    OPEN: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    IN_PROGRESS: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    RESOLVED: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
    CLOSED: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
    REJECTED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
};

const PRIORITY_CONFIG = {
    LOW: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
    MEDIUM: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
    HIGH: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
    CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function TechnicianDashboard({ standalone = false }) {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [actionLoading, setActionLoading] = useState('');

    // Resolution notes modal
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolveTicketId, setResolveTicketId] = useState('');
    const [resolutionNotes, setResolutionNotes] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await getTechnicianTickets();
            setTickets(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load assigned tickets');
        } finally {
            setLoading(false);
        }
    };

    const filtered = statusFilter ? tickets.filter(t => t.status === statusFilter) : tickets;

    const handleResolve = async () => {
        setActionLoading(resolveTicketId);
        try {
            await updateTicketStatus(resolveTicketId, 'RESOLVED', { remarks: resolutionNotes });
            setShowResolveModal(false);
            setResolutionNotes('');
            fetchTickets();
            toast.success('Ticket resolved');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to resolve');
        } finally {
            setActionLoading('');
        }
    };

    const stats = {
        total: tickets.length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        closed: tickets.filter(t => t.status === 'CLOSED').length,
    };

    return (
        <div className={standalone ? '' : 'min-h-screen bg-slate-900 relative overflow-hidden pt-24 pb-6'}>
            {/* Background decoration */}
            {!standalone && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 -left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-0 -right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            )}

            <div className={`relative z-10 ${standalone ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-3 mb-2">
                            <span className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">🔧</span>
                            My Assigned <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500 ml-1.5">Tickets</span>
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Welcome back, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span>. Here are your current assignments.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Assigned</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-600 drop-shadow-sm">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">In Progress</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600 drop-shadow-sm">{stats.inProgress}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Resolved</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-600 drop-shadow-sm">{stats.resolved}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-500/50 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-500/10 rounded-full blur-2xl group-hover:bg-slate-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Closed</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-slate-400 drop-shadow-sm">{stats.closed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-2 rounded-2xl mb-8 flex overflow-x-auto custom-scrollbar">
                    {['', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex-1 min-w-[120px] px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${statusFilter === status
                                ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                                }`}
                        >
                            {status ? status.replace('_', ' ') : 'All Tickets'}
                        </button>
                    ))}
                </div>

                {/* Tickets */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-800/40 rounded-2xl animate-pulse border border-slate-700/50" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-inner">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-110 transition-transform duration-500">
                            <span className="text-5xl">🔧</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No tickets found</h3>
                        <p className="text-slate-400 max-w-md mx-auto">You don't have any assigned tickets matching this status.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(ticket => (
                            <div key={ticket.id} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600 hover:shadow-xl transition-all duration-300 group">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase border ${STATUS_CONFIG[ticket.status]?.color}`}>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[ticket.status]?.dot} ${ticket.status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`}></div>
                                                    {ticket.status.replace('_', ' ')}
                                                </div>
                                            </span>
                                            <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${PRIORITY_CONFIG[ticket.priority]?.bg} ${PRIORITY_CONFIG[ticket.priority]?.color} border-${PRIORITY_CONFIG[ticket.priority]?.bg.split('-')[1]}-500/30`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <Link to={`/tickets/${ticket.id}`} className="text-xl font-bold text-white hover:text-blue-400 transition-colors block mb-1">
                                            {ticket.facilityName}
                                        </Link>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-blue-400/80 uppercase tracking-wider text-xs font-bold">{ticket.category?.replace('_', ' ')}</span>
                                            <span className="text-slate-600 text-xs">•</span>
                                            <span className="text-slate-400 text-sm flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-[15px] line-clamp-2 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">{ticket.description}</p>
                                        <div className="flex p-2 rounded-xl border border-slate-700/50">
                                            <span className="text-sm text-slate-300 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">{ticket.userName?.charAt(0)}</div>
                                                {ticket.userName}
                                            </span>
                                            {ticket.contactEmail && (
                                                <>
                                                    <span className="text-slate-600 text-sm">|</span>
                                                    <span className="text-sm text-slate-400 flex items-center gap-1.5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                                        {ticket.contactEmail}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0 pt-2 sm:pt-0">
                                        {ticket.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => { setResolveTicketId(ticket.id); setShowResolveModal(true); }}
                                                disabled={actionLoading === ticket.id}
                                                className="w-full sm:w-auto px-5 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex justify-center items-center gap-2 border border-emerald-400/30"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                                {actionLoading === ticket.id ? 'Resolving...' : 'Resolve'}
                                            </button>
                                        )}
                                        <Link to={`/tickets/${ticket.id}`} className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex justify-center items-center gap-2 border border-slate-600 hover:border-slate-500 shadow-sm whitespace-nowrap">
                                            View Details
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resolve Modal */}
            {showResolveModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white text-2xl font-bold flex items-center gap-3">
                                <span className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">✅</span>
                                Resolve Ticket
                            </h3>
                            <button onClick={() => setShowResolveModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <div className="mb-6 bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
                            <label className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 block">Resolution Notes</label>
                            <textarea
                                value={resolutionNotes}
                                onChange={(e) => setResolutionNotes(e.target.value)}
                                placeholder="Describe the actions taken to resolve this issue (optional but recommended)..."
                                className="w-full h-32 bg-linear-to-b from-slate-900/80 to-slate-900/90 border border-slate-800 rounded-xl p-4 text-white text-[15px] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none transition-all shadow-inner opacity-100"
                            />
                        </div>
                        <div className="flex gap-4 justify-end">
                            <button onClick={() => setShowResolveModal(false)} className="px-6 py-3 text-slate-300 font-bold hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">Cancel</button>
                            <button
                                onClick={handleResolve}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Resolving...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        Mark as Resolved
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
