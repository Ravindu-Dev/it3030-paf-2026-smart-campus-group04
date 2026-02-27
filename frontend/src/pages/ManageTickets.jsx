import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTickets, assignTechnician, rejectTicket, deleteTicket } from '../services/ticketService';
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

export default function ManageTickets({ standalone = false }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Assign Modal
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTicketId, setAssignTicketId] = useState('');
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechId, setSelectedTechId] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Reject Modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTicketId, setRejectTicketId] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchTickets();
    }, [statusFilter, priorityFilter]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await getAllTickets({ status: statusFilter, priority: priorityFilter });
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
            t.description?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q);
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

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setActionLoading(true);
        try {
            await rejectTicket(rejectTicketId, { remarks: rejectReason });
            setShowRejectModal(false);
            setRejectReason('');
            fetchTickets();
            toast.success('Ticket rejected');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (ticketId) => {
        if (!window.confirm('Delete this ticket permanently?')) return;
        try {
            await deleteTicket(ticketId);
            fetchTickets();
            toast.success('Ticket deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED').length,
        critical: tickets.filter(t => t.priority === 'CRITICAL').length,
    };

    return (
        <div className={standalone ? '' : 'min-h-screen bg-slate-900'}>
            <div className={standalone ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
                <h2 className="text-2xl font-bold text-white mb-6">Manage Tickets</h2>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {[
                        { label: 'Total', value: stats.total, color: 'blue' },
                        { label: 'Open', value: stats.open, color: 'blue' },
                        { label: 'In Progress', value: stats.inProgress, color: 'amber' },
                        { label: 'Resolved', value: stats.resolved, color: 'emerald' },
                        { label: 'Critical', value: stats.critical, color: 'red' },
                    ].map((s, i) => (
                        <div key={i} className={`bg-${s.color}-500/10 border border-${s.color}-500/20 rounded-xl p-4`}>
                            <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
                            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
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
                        <option value="REJECTED">Rejected</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 cursor-pointer"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                {/* Tickets Table */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-800/60 rounded-xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        <span className="text-4xl">🎫</span>
                        <p className="text-slate-400 mt-3">No tickets found</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(ticket => (
                            <div key={ticket.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/80 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_CONFIG[ticket.status]?.color}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITY_CONFIG[ticket.priority]?.bg} ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className="text-slate-500 text-[10px]">{ticket.category?.replace('_', ' ')}</span>
                                        </div>
                                        <Link to={`/tickets/${ticket.id}`} className="text-white font-medium text-sm hover:text-amber-400 transition-colors">
                                            {ticket.facilityName}
                                        </Link>
                                        <p className="text-slate-400 text-xs mt-0.5 truncate">{ticket.description}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                                            <span>👤 {ticket.userName}</span>
                                            <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            {ticket.assignedTechnicianName && <span>🔧 {ticket.assignedTechnicianName}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                                            <button onClick={() => openAssign(ticket.id)} className="px-3 py-1.5 bg-blue-500/15 text-blue-400 rounded-lg text-xs hover:bg-blue-500/25 cursor-pointer" title="Assign Technician">
                                                🔧
                                            </button>
                                        )}
                                        {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                                            <button onClick={() => { setRejectTicketId(ticket.id); setShowRejectModal(true); }} className="px-3 py-1.5 bg-red-500/15 text-red-400 rounded-lg text-xs hover:bg-red-500/25 cursor-pointer" title="Reject">
                                                ✕
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(ticket.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400/60 rounded-lg text-xs hover:bg-red-500/20 cursor-pointer" title="Delete">
                                            🗑
                                        </button>
                                        <Link to={`/tickets/${ticket.id}`} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-xs hover:bg-slate-700 transition-colors" title="View">
                                            →
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

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white text-lg font-semibold mb-4">Reject Ticket</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full h-28 bg-slate-700/50 border border-slate-600/50 rounded-xl p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none"
                        />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="px-4 py-2 text-slate-400 text-sm cursor-pointer">Cancel</button>
                            <button onClick={handleReject} disabled={!rejectReason.trim() || actionLoading} className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 cursor-pointer">
                                {actionLoading ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
