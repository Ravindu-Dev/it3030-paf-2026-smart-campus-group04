import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets } from '../services/ticketService';
import toast from 'react-hot-toast';

const STATUS_TABS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

const STATUS_CONFIG = {
    OPEN: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    IN_PROGRESS: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    RESOLVED: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
    CLOSED: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
    REJECTED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
};

const PRIORITY_CONFIG = {
    LOW: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Low' },
    MEDIUM: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Medium' },
    HIGH: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'High' },
    CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Critical' },
};

export default function MyTickets({ standalone = false }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await getMyTickets();
            setTickets(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    const filtered = activeTab === 'ALL' ? tickets : tickets.filter(t => t.status === activeTab);

    const statusCounts = STATUS_TABS.reduce((acc, s) => {
        acc[s] = s === 'ALL' ? tickets.length : tickets.filter(t => t.status === s).length;
        return acc;
    }, {});

    const Container = standalone ? 'div' : 'div';

    return (
        <Container className={standalone ? '' : 'min-h-screen bg-slate-900'}>
            <div className={standalone ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Tickets</h1>
                        <p className="text-slate-400 text-sm mt-1">Track your maintenance and incident reports</p>
                    </div>
                    <Link
                        to="/tickets/new"
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 text-sm"
                    >
                        + New Ticket
                    </Link>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-1 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1.5 mb-6 overflow-x-auto">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${activeTab === tab
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-white/20' : 'bg-slate-700/80'
                                }`}>
                                {statusCounts[tab]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-slate-800/60 rounded-2xl animate-pulse border border-slate-700/50" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        <span className="text-5xl mb-4 block">🎫</span>
                        <p className="text-slate-400 text-lg">{activeTab === 'ALL' ? 'No tickets yet' : `No ${activeTab.replace('_', ' ').toLowerCase()} tickets`}</p>
                        <p className="text-slate-500 text-sm mt-1">Report an issue to get started</p>
                        <Link
                            to="/tickets/new"
                            className="inline-block mt-4 px-6 py-2.5 bg-amber-500/20 text-amber-400 rounded-xl font-medium hover:bg-amber-500/30 transition-all text-sm"
                        >
                            Create Ticket
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map(ticket => (
                            <Link
                                key={ticket.id}
                                to={`/tickets/${ticket.id}`}
                                className="block bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/80 hover:bg-slate-800/80 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[ticket.status]?.color}`}>
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[ticket.status]?.dot} mr-1.5`} />
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[ticket.priority]?.bg} ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors truncate">
                                            {ticket.facilityName} — {ticket.category?.replace('_', ' ')}
                                        </h3>
                                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{ticket.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                            <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                            {ticket.assignedTechnicianName && (
                                                <span>🔧 {ticket.assignedTechnicianName}</span>
                                            )}
                                            {ticket.commentCount > 0 && (
                                                <span>💬 {ticket.commentCount}</span>
                                            )}
                                            {ticket.imageUrls?.length > 0 && (
                                                <span>📷 {ticket.imageUrls.length}</span>
                                            )}
                                        </div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0 ml-4">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
