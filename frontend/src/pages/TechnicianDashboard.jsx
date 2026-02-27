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
        <div className={standalone ? '' : 'min-h-screen bg-slate-900'}>
            <div className={standalone ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        My Assigned Tickets
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]}. Here are your current assignments.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                        <p className="text-slate-400 text-sm mt-1">Total Assigned</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-amber-400">{stats.inProgress}</p>
                        <p className="text-slate-400 text-sm mt-1">In Progress</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-emerald-400">{stats.resolved}</p>
                        <p className="text-slate-400 text-sm mt-1">Resolved</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-600/20 to-slate-600/5 border border-slate-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-slate-400">{stats.closed}</p>
                        <p className="text-slate-400 text-sm mt-1">Closed</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1.5 mb-6 overflow-x-auto">
                    {['', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${statusFilter === status
                                    ? 'bg-amber-500 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {status ? status.replace('_', ' ') : 'All'}
                        </button>
                    ))}
                </div>

                {/* Tickets */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-800/60 rounded-2xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        <span className="text-5xl mb-4 block">🔧</span>
                        <p className="text-slate-400 text-lg">No assigned tickets</p>
                        <p className="text-slate-500 text-sm mt-1">Tickets assigned to you will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(ticket => (
                            <div key={ticket.id} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/80 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[ticket.status]?.color}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[ticket.priority]?.bg} ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <Link to={`/tickets/${ticket.id}`} className="text-white font-medium hover:text-amber-400 transition-colors">
                                            {ticket.facilityName} — {ticket.category?.replace('_', ' ')}
                                        </Link>
                                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{ticket.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span>👤 {ticket.userName}</span>
                                            <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            {ticket.contactEmail && <span>📧 {ticket.contactEmail}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        {ticket.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => { setResolveTicketId(ticket.id); setShowResolveModal(true); }}
                                                disabled={actionLoading === ticket.id}
                                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40 cursor-pointer shadow-lg shadow-emerald-500/20"
                                            >
                                                ✅ Resolve
                                            </button>
                                        )}
                                        <Link to={`/tickets/${ticket.id}`} className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-colors">
                                            View →
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white text-lg font-semibold mb-4">Resolve Ticket</h3>
                        <textarea
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Add resolution notes (optional)..."
                            className="w-full h-28 bg-slate-700/50 border border-slate-600/50 rounded-xl p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                        />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => setShowResolveModal(false)} className="px-4 py-2 text-slate-400 text-sm cursor-pointer">Cancel</button>
                            <button
                                onClick={handleResolve}
                                disabled={actionLoading}
                                className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-400 disabled:opacity-40 cursor-pointer"
                            >
                                {actionLoading ? 'Resolving...' : 'Mark Resolved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
