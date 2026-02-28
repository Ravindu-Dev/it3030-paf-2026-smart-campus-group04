import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllTickets, assignTechnician } from '../services/ticketService';
import { getTechnicians } from '../services/ticketService';
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

export default function ManagerDashboard({ standalone = false }) {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Assign Modal
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTicketId, setAssignTicketId] = useState('');
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechId, setSelectedTechId] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await getAllTickets({ status: statusFilter });
            setTickets(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const filtered = tickets.filter(t => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return t.facilityName?.toLowerCase().includes(q) ||
            t.userName?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q);
    });

    const openAssign = async (ticketId) => {
        setAssignTicketId(ticketId);
        setSelectedTechId('');
        setShowAssignModal(true);
        try {
            const res = await getTechnicians();
            setTechnicians(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load technicians');
        }
    };

    const handleAssign = async () => {
        if (!selectedTechId) return;
        setActionLoading(true);
        try {
            await assignTechnician(assignTicketId, { technicianId: selectedTechId });
            setShowAssignModal(false);
            fetchTickets();
            toast.success('Technician assigned');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to assign');
        } finally {
            setActionLoading(false);
        }
    };

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        unassigned: tickets.filter(t => !t.assignedTechnicianId && t.status === 'OPEN').length,
    };

    return (
        <div className={standalone ? '' : 'min-h-screen bg-slate-900'}>
            <div className={standalone ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        Manager Dashboard
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Overview of all maintenance tickets across campus</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                        <p className="text-slate-400 text-sm mt-1">Total</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-blue-400">{stats.open}</p>
                        <p className="text-slate-400 text-sm mt-1">Open</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-amber-400">{stats.inProgress}</p>
                        <p className="text-slate-400 text-sm mt-1">In Progress</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-emerald-400">{stats.resolved}</p>
                        <p className="text-slate-400 text-sm mt-1">Resolved</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/20 rounded-2xl p-5">
                        <p className="text-3xl font-bold text-red-400">{stats.unassigned}</p>
                        <p className="text-slate-400 text-sm mt-1">Unassigned</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tickets..."
                        className="flex-1 min-w-[200px] bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>

                {/* Tickets */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-800/60 rounded-2xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        <span className="text-5xl mb-4 block">📊</span>
                        <p className="text-slate-400 text-lg">No tickets found</p>
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
                                            {!ticket.assignedTechnicianId && ticket.status === 'OPEN' && (
                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px] font-medium">
                                                    ⚠ Unassigned
                                                </span>
                                            )}
                                        </div>
                                        <Link to={`/tickets/${ticket.id}`} className="text-white font-medium hover:text-amber-400 transition-colors">
                                            {ticket.facilityName} — {ticket.category?.replace('_', ' ')}
                                        </Link>
                                        <p className="text-slate-400 text-sm mt-1 line-clamp-1">{ticket.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span>👤 {ticket.userName}</span>
                                            <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            {ticket.assignedTechnicianName && <span>🔧 {ticket.assignedTechnicianName}</span>}
                                            {ticket.commentCount > 0 && <span>💬 {ticket.commentCount}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                                            <button onClick={() => openAssign(ticket.id)} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 cursor-pointer">
                                                🔧 Assign
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

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white text-lg font-semibold mb-4">Assign Technician</h3>
                        {technicians.length === 0 ? (
                            <p className="text-slate-400 text-sm py-4">No technicians available</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                                {technicians.map(tech => (
                                    <button
                                        key={tech.id}
                                        onClick={() => setSelectedTechId(tech.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedTechId === tech.id
                                                ? 'bg-amber-500/10 border-amber-500/50'
                                                : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <p className="text-white text-sm font-medium">{tech.name}</p>
                                        <p className="text-slate-400 text-xs">{tech.email}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-slate-400 text-sm cursor-pointer">Cancel</button>
                            <button onClick={handleAssign} disabled={!selectedTechId || actionLoading} className="px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 cursor-pointer">
                                {actionLoading ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
