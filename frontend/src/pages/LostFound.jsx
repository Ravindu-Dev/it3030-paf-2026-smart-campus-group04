import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllLostFoundItems, getLostFoundItemById, claimLostFoundItem } from '../services/lostFoundService';
import toast from 'react-hot-toast';

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

    // Modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);

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

    const openItemModal = async (itemId) => {
        setModalLoading(true);
        setSelectedItem(null);
        try {
            const res = await getLostFoundItemById(itemId);
            setSelectedItem(res.data?.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load item details.');
            setModalLoading(false);
            return;
        }
        setModalLoading(false);
    };

    const closeModal = () => {
        setSelectedItem(null);
        setModalLoading(false);
    };

    const handleClaim = async () => {
        if (!user) { toast.error('Please log in to claim.'); return; }
        if (!selectedItem) return;
        setClaiming(true);
        try {
            const res = await claimLostFoundItem(selectedItem.id);
            setSelectedItem(res.data?.data);
            // Update the item in the grid too
            setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: 'CLAIMED' } : i));
            toast.success('Item claimed successfully! The reporter has been notified.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to claim item.');
        } finally {
            setClaiming(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header / Hero */}
            <div className="pt-32 pb-20 text-center px-4 sm:px-6 lg:px-8 relative z-10 border-b border-slate-800/50 mb-10">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                    Lost & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Found</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto drop-shadow-md">
                    Report lost items on campus or help reunite found items with their owners.
                </p>
                {user && (
                    <Link
                        to="/lost-found/report"
                        className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-500/50 text-white rounded-xl font-bold transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Report an Item
                    </Link>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-16">

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
                                className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            />
                            <button type="submit" className="px-5 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-colors cursor-pointer">
                                Search
                            </button>
                        </form>

                        {/* Type Filter */}
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                            <option value="">All Types</option>
                            <option value="LOST">🔍 Lost</option>
                            <option value="FOUND">📦 Found</option>
                        </select>

                        {/* Category Filter */}
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
                            <option value="">All Categories</option>
                            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer">
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
                                <div
                                    key={item.id}
                                    onClick={() => openItemModal(item.id)}
                                    className="group bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col cursor-pointer"
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
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Item Detail Modal ───────────────────────────────────────── */}
            {(selectedItem || modalLoading) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    {/* Blurred backdrop */}
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />

                    {/* Modal content */}
                    <div
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-800/95 backdrop-blur-xl border border-slate-700/60 shadow-2xl shadow-black/50 custom-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'modalIn 0.3s ease-out' }}
                    >
                        {modalLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        ) : selectedItem && (() => {
                            const catCfg = CATEGORY_CONFIG[selectedItem.category] || CATEGORY_CONFIG.OTHER;
                            const statusCfg = STATUS_BADGE[selectedItem.status] || STATUS_BADGE.OPEN;
                            const isLost = selectedItem.type === 'LOST';

                            return (
                                <>
                                    {/* Type / Status Header with Close */}
                                    <div className={`px-6 py-3 flex items-center justify-between rounded-t-3xl ${isLost ? 'bg-red-500/10 border-b border-red-500/20' : 'bg-emerald-500/10 border-b border-emerald-500/20'}`}>
                                        <span className={`text-sm font-bold uppercase tracking-wider ${isLost ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {isLost ? '🔍 Lost Item' : '📦 Found Item'}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                                {statusCfg.label}
                                            </span>
                                            <button
                                                onClick={closeModal}
                                                className="w-9 h-9 bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-slate-600/50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image */}
                                    {selectedItem.imageUrl && (
                                        <div className="border-b border-slate-700/50">
                                            <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-64 object-cover" />
                                        </div>
                                    )}

                                    <div className="p-6 md:p-8 space-y-6">
                                        {/* Title & Category */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl flex items-center justify-center border shadow-md shrink-0"
                                                style={{ backgroundColor: `${catCfg.color}20`, borderColor: `${catCfg.color}40` }}>
                                                <span className="text-2xl">{catCfg.icon}</span>
                                            </div>
                                            <div>
                                                <h1 className="text-2xl font-extrabold text-white">{selectedItem.title}</h1>
                                                <span className="text-sm font-medium" style={{ color: catCfg.color }}>{catCfg.label}</span>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Description</h3>
                                            <p className="text-slate-300 leading-relaxed">{selectedItem.description}</p>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedItem.location && (
                                                <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Location</div>
                                                    <div className="text-white font-semibold flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        {selectedItem.location}
                                                    </div>
                                                </div>
                                            )}
                                            {selectedItem.dateOccurred && (
                                                <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Date</div>
                                                    <div className="text-white font-semibold">{selectedItem.dateOccurred}</div>
                                                </div>
                                            )}
                                            <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Reported By</div>
                                                <div className="text-white font-semibold">{selectedItem.reportedByUserName}</div>
                                            </div>
                                            {selectedItem.contactEmail && (
                                                <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Contact</div>
                                                    <div className="text-white font-semibold text-sm">{selectedItem.contactEmail}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Claimed info */}
                                        {selectedItem.status === 'CLAIMED' && selectedItem.claimedByUserName && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                                <div className="text-xs text-blue-400 mb-1 uppercase tracking-wide font-bold">Claimed By</div>
                                                <div className="text-white font-semibold">{selectedItem.claimedByUserName}</div>
                                                {selectedItem.claimedAt && <div className="text-slate-400 text-xs mt-1">{new Date(selectedItem.claimedAt).toLocaleString()}</div>}
                                            </div>
                                        )}

                                        {/* Admin notes */}
                                        {selectedItem.adminNotes && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                                <div className="text-xs text-blue-400 mb-1 uppercase tracking-wide font-bold">Admin Notes</div>
                                                <p className="text-slate-300">{selectedItem.adminNotes}</p>
                                            </div>
                                        )}

                                        {/* Claim Button */}
                                        {selectedItem.status === 'OPEN' && user && user.id !== selectedItem.reportedByUserId && (
                                            <button
                                                onClick={handleClaim}
                                                disabled={claiming}
                                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                                            >
                                                {claiming ? 'Claiming...' : isLost ? '🙋 I Found This Item — Claim' : '🙋 This Is Mine — Claim'}
                                            </button>
                                        )}

                                        {!user && selectedItem.status === 'OPEN' && (
                                            <Link
                                                to="/login"
                                                className="block w-full text-center py-3.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl font-medium transition-colors hover:bg-slate-700"
                                            >
                                                Log in to Claim This Item
                                            </Link>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Modal animation */}
            <style>{`
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
