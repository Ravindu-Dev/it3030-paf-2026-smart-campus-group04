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
        <Container className={standalone ? '' : 'min-h-screen bg-slate-900 relative overflow-hidden pt-24 pb-4 sm:pt-28 sm:pb-10'}>
            {/* Background decoration */}
            {!standalone && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
            )}

            <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${standalone ? '' : 'py-8 z-10'}`}>
                {/* Header */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 ${standalone ? '' : 'pb-6 border-b border-slate-700/50'}`}>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Tickets</span>
                        </h1>
                        <p className="text-slate-300 text-lg mt-2">Track your maintenance and incident reports</p>
                    </div>
                    <Link
                        to="/tickets/new"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:-translate-y-0.5"
                    >
                        <span className="mr-2 text-lg">+</span> New Ticket
                    </Link>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-1 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-1.5 mb-8 overflow-x-auto shadow-lg">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === tab
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab ? 'bg-white/25 text-white' : 'bg-slate-700/80 text-slate-300'
                                }`}>
                                {statusCounts[tab]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-slate-800/40 backdrop-blur-xl rounded-3xl animate-pulse border border-slate-700/50" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>
                        <span className="text-6xl mb-6 block transform group-hover:scale-110 transition-transform duration-500">🎫</span>
                        <p className="text-slate-300 text-xl font-semibold mb-2">{activeTab === 'ALL' ? 'No tickets yet' : `No ${activeTab.replace('_', ' ').toLowerCase()} tickets`}</p>
                        <Link
                            to="/tickets/new"
                            className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl font-bold transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                            <span>Create Ticket</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map(ticket => (
                            <Link
                                key={ticket.id}
                                to={`/tickets/${ticket.id}`}
                                className="block bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:border-slate-500/50 hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>

                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex items-start justify-between mb-4 gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center shadow-sm ${STATUS_CONFIG[ticket.status]?.color}`}>
                                                <span className={`inline-block w-2 h-2 rounded-full ${STATUS_CONFIG[ticket.status]?.dot} mr-2 shadow-sm`} />
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-transparent shadow-sm ${PRIORITY_CONFIG[ticket.priority]?.bg} ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                                                {ticket.priority}
                                            </span>
                                        </div>
                                        <div className="p-2 bg-slate-700/30 rounded-xl group-hover:bg-amber-500/10 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-amber-400 transition-colors flex-shrink-0">
                                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <h3 className="text-white text-lg font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-orange-400 transition-all line-clamp-1 mb-2">
                                        {ticket.facilityName}
                                    </h3>

                                    <p className="text-amber-400/80 text-xs font-semibold uppercase tracking-wider mb-2">
                                        {ticket.category?.replace('_', ' ')}
                                    </p>

                                    <p className="text-slate-400 text-sm line-clamp-2 flex-grow mb-6 leading-relaxed">
                                        {ticket.description}
                                    </p>

                                    <div className="flex items-center gap-5 pt-4 border-t border-slate-700/50 mt-auto">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </div>

                                        <div className="flex items-center gap-4 ml-auto">
                                            {ticket.commentCount > 0 && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400" title="Comments">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                                    {ticket.commentCount}
                                                </div>
                                            )}
                                            {ticket.imageUrls?.length > 0 && (
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400" title="Attachments">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                                    {ticket.imageUrls.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Container>
    );
}
