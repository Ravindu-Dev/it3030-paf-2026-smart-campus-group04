import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllLostFoundItems } from '../services/lostFoundService';

const CATEGORY_CONFIG = {
    ELECTRONICS: { label: 'Electronics', icon: '💻', color: '#3b82f6' },
    CLOTHING: { label: 'Clothing', icon: '👕', color: '#a855f7' },
    DOCUMENTS: { label: 'Documents', icon: '📄', color: '#10b981' },
    ACCESSORIES: { label: 'Accessories', icon: '⌚', color: '#f59e0b' },
    KEYS: { label: 'Keys', icon: '🔑', color: '#ef4444' },
    BAGS: { label: 'Bags', icon: '🎒', color: '#6366f1' },
    OTHER: { label: 'Other', icon: '📦', color: '#64748b' },
};

const STATUS_BADGE = {
    OPEN: { label: 'Open', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    CLAIMED: { label: 'Claimed', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    CLOSED: { label: 'Closed', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export default function LostFound() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => { fetchItems(); }, [filterType, filterCategory, filterStatus]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterType) params.type = filterType;
            if (filterCategory) params.category = filterCategory;
            if (filterStatus) params.status = filterStatus;
            if (search.trim()) params.search = search.trim();
            const res = await getAllLostFoundItems(params);
            setItems(res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch lost & found items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems();
    };

    return (
        <div className="min-h-screen bg-slate-900 pt-28 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                        Lost & <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Found</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Report lost items on campus or help reunite found items with their owners.
                    </p>
                    {user && (
                        <Link
                            to="/lost-found/report"
                            className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Report an Item
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title..."
                                className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                            />
                            <button type="submit" className="px-5 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/30 transition-colors cursor-pointer">
                                Search
                            </button>
                        </form>

                        {/* Type Filter */}
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer">
                            <option value="">All Types</option>
                            <option value="LOST">🔍 Lost</option>
                            <option value="FOUND">📦 Found</option>
                        </select>

                        {/* Category Filter */}
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer">
                            <option value="">All Categories</option>
                            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer">
                            <option value="">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="CLAIMED">Claimed</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>

                {/* Items Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-slate-800/50 rounded-2xl border border-slate-700/50 animate-pulse"></div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No Items Found</h3>
                        <p className="text-slate-500">There are no lost or found items matching your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => {
                            const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.OTHER;
                            const statusCfg = STATUS_BADGE[item.status] || STATUS_BADGE.OPEN;
                            const isLost = item.type === 'LOST';

                            return (
                                <Link
                                    key={item.id}
                                    to={`/lost-found/${item.id}`}
                                    className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 flex flex-col"
                                >
                                    {/* Type banner */}
                                    <div className={`px-5 py-2 text-xs font-bold uppercase tracking-wider text-center ${isLost ? 'bg-red-500/20 text-red-400 border-b border-red-500/20' : 'bg-emerald-500/20 text-emerald-400 border-b border-emerald-500/20'}`}>
                                        {isLost ? '🔍 Lost Item' : '📦 Found Item'}
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* Title and Status */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md"
                                                    style={{ backgroundColor: `${catCfg.color}20`, borderColor: `${catCfg.color}40` }}>
                                                    <span className="text-lg">{catCfg.icon}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-base leading-tight line-clamp-1">{item.title}</h3>
                                                    <span className="text-xs font-medium" style={{ color: catCfg.color }}>{catCfg.label}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                                {statusCfg.label}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>

                                        {/* Meta */}
                                        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-3 mt-auto">
                                            <div className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {item.location || 'Unknown'}
                                            </div>
                                            <div>{item.dateOccurred || new Date(item.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
