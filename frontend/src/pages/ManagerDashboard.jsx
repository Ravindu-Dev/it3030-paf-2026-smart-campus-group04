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
        <div className={standalone ? '' : 'min-h-screen bg-slate-900 relative overflow-hidden pt-24 pb-6'}>
            {/* Background decoration */}
            {!standalone && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 -left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-0 -right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            )}

            <div className={`relative z-10 ${standalone ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md flex items-center gap-3 mb-2">
                            <span className="p-2.5 bg-amber-500/20 rounded-xl text-amber-500">📊</span>
                            Equipment <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 ml-1.5">Overview</span>
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Overview of all maintenance tickets across campus.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 drop-shadow-sm">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-400/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Open</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500 drop-shadow-sm">{stats.open}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">In Progress</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-sm">{stats.inProgress}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Resolved</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 drop-shadow-sm">{stats.resolved}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/40 transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <p className="text-red-400/80 text-xs font-bold uppercase tracking-wider mb-2">Unassigned</p>
                            <div className="flex items-end gap-3 mt-auto">
                                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 drop-shadow-sm">{stats.unassigned}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl mb-8 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[250px] relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tickets by facility, user, or description..."
                            className="w-full bg-slate-900/50 border border-slate-600/50 rounded-xl pl-11 pr-4 py-3 text-white text-[15px] placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all shadow-inner"
                        />
                    </div>
                    <div className="min-w-[200px] relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none bg-slate-900/50 border border-slate-600/50 rounded-xl pl-4 pr-10 py-3 text-white text-[15px] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 cursor-pointer transition-all shadow-inner"
                        >
                            <option value="" className="bg-slate-800">All Statuses</option>
                            <option value="OPEN" className="bg-slate-800">Open</option>
                            <option value="IN_PROGRESS" className="bg-slate-800">In Progress</option>
                            <option value="RESOLVED" className="bg-slate-800">Resolved</option>
                            <option value="CLOSED" className="bg-slate-800">Closed</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                    </div>
                </div>

                {/* Tickets */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-800/40 rounded-2xl animate-pulse border border-slate-700/50" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-inner">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-110 transition-transform duration-500">
                            <span className="text-5xl">📊</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No tickets found</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Try adjusting your search criteria or status filters.</p>
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
                                                    <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[ticket.status]?.dot} ${ticket.status === 'IN_PROGRESS' || ticket.status === 'OPEN' ? 'animate-pulse' : ''}`}></div>
                                                    {ticket.status.replace('_', ' ')}
                                                </div>
                                            </span>
                                            <span className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${PRIORITY_CONFIG[ticket.priority]?.bg} ${PRIORITY_CONFIG[ticket.priority]?.color} border-${PRIORITY_CONFIG[ticket.priority]?.bg.split('-')[1]}-500/30`}>
                                                {ticket.priority}
                                            </span>
                                            {!ticket.assignedTechnicianId && ticket.status === 'OPEN' && (
                                                <span className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                    </span>
                                                    Unassigned
                                                </span>
                                            )}
                                        </div>
                                        <Link to={`/tickets/${ticket.id}`} className="text-xl font-bold text-white hover:text-amber-400 transition-colors block mb-1">
                                            {ticket.facilityName}
                                        </Link>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-amber-500/80 uppercase tracking-wider text-xs font-bold">{ticket.category?.replace('_', ' ')}</span>
                                            <span className="text-slate-600 text-xs">•</span>
                                            <span className="text-slate-400 text-sm flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-[15px] line-clamp-2 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">{ticket.description}</p>

                                        <div className="flex flex-wrap items-center gap-4 mt-4 bg-slate-800/50 inline-flex p-2 rounded-xl border border-slate-700/50">
                                            <span className="text-sm text-slate-300 flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">{ticket.userName?.charAt(0)}</div>
                                                {ticket.userName}
                                            </span>
                                            {ticket.assignedTechnicianName && (
                                                <>
                                                    <span className="text-slate-600 text-sm">|</span>
                                                    <span className="text-sm text-blue-400 flex items-center gap-1.5 font-medium">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                                        {ticket.assignedTechnicianName}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0 pt-2 sm:pt-0">
                                        {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                                            <button
                                                onClick={() => openAssign(ticket.id)}
                                                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-sm ${!ticket.assignedTechnicianId
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/30'
                                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                                                    }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                                                {ticket.assignedTechnicianId ? 'Reassign' : 'Assign Tech'}
                                            </button>
                                        )}
                                        <Link to={`/tickets/${ticket.id}`} className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex justify-center items-center gap-2 border border-slate-600 hover:border-slate-500 whitespace-nowrap">
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

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white text-2xl font-bold flex items-center gap-3">
                                <span className="p-2 bg-blue-500/20 rounded-xl text-blue-400">🔧</span>
                                Assign Technician
                            </h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        {technicians.length === 0 ? (
                            <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-700/50 mb-6">
                                <p className="text-slate-400 text-sm">No technicians available in the system.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar mb-6">
                                {technicians.map(tech => (
                                    <button
                                        key={tech.id}
                                        onClick={() => setSelectedTechId(tech.id)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer group flex items-center gap-4 ${selectedTechId === tech.id
                                            ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] pb-4' // Fixed tailwind classes
                                            : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600/80'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${selectedTechId === tech.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
                                            }`}>
                                            {tech.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[15px] font-bold transition-colors ${selectedTechId === tech.id ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                                }`}>{tech.name}</p>
                                            <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                                {tech.email}
                                            </p>
                                        </div>
                                        {selectedTechId === tech.id && (
                                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg transform scale-100 animate-in zoom-in">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-4 justify-end">
                            <button onClick={() => setShowAssignModal(false)} className="px-6 py-3 text-slate-300 font-bold hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">Cancel</button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedTechId || actionLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                                        Assign Selected
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
