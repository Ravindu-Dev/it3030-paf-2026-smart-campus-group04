import { useState, useEffect } from 'react';
import { getAllLostFoundItems, closeLostFoundItem, deleteLostFoundItem } from '../services/lostFoundService';
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
    OPEN: { label: 'Open', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    CLAIMED: { label: 'Claimed', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    CLOSED: { label: 'Closed', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400' },
};

export default function ManageLostFound() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [closeNotes, setCloseNotes] = useState('');
    const [showClosePanel, setShowClosePanel] = useState(false);

    useEffect(() => { fetchItems(); }, [filterStatus, filterType]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterType) params.type = filterType;
            const res = await getAllLostFoundItems(params);
            setItems(res.data?.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load items.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async (id) => {
        try {
            await closeLostFoundItem(id, { adminNotes: closeNotes });
            toast.success('Item closed successfully.');
            setShowClosePanel(false);
            setCloseNotes('');
            // Update inline
            const updatedItems = items.map(i => i.id === id ? { ...i, status: 'CLOSED', adminNotes: closeNotes } : i);
            setItems(updatedItems);
            if (selectedItem?.id === id) setSelectedItem({ ...selectedItem, status: 'CLOSED', adminNotes: closeNotes });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to close item.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item permanently?')) return;
        try {
            await deleteLostFoundItem(id);
            toast.success('Item deleted.');
            setItems(items.filter(i => i.id !== id));
            if (selectedItem?.id === id) setSelectedItem(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete.');
        }
    };

    // ─── DETAIL VIEW ─────────────────────────────────────────────────
    if (selectedItem) {
        const item = selectedItem;
        const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.OTHER;
        const statusCfg = STATUS_BADGE[item.status] || STATUS_BADGE.OPEN;
        const isLost = item.type === 'LOST';

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Back Button */}
                <button
                    onClick={() => { setSelectedItem(null); setShowClosePanel(false); setCloseNotes(''); }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to All Items
                </button>

                {/* Item Detail Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
                    {/* Header Banner */}
                    <div className={`px-6 py-4 flex items-center justify-between ${isLost ? 'bg-red-500/10 border-b border-red-500/20' : 'bg-emerald-500/10 border-b border-emerald-500/20'}`}>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold uppercase tracking-wider ${isLost ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isLost ? '🔍 Lost Item' : '📦 Found Item'}
                            </span>
                            <span className="text-xs text-slate-500">#{item.id?.slice(-6)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} flex items-center gap-1.5`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                                {statusCfg.label}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column — Image & Title */}
                            <div className="lg:col-span-1 space-y-5">
                                {/* Image */}
                                {item.imageUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-56 object-cover rounded-xl border border-slate-700/50 shadow-lg"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                ) : (
                                    <div className="w-full h-56 bg-slate-900/50 border border-slate-700/50 rounded-xl flex flex-col items-center justify-center">
                                        <span className="text-5xl mb-2">{catCfg.icon}</span>
                                        <span className="text-slate-500 text-sm">No image attached</span>
                                    </div>
                                )}

                                {/* Category Badge */}
                                <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-slate-700/40 rounded-xl">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
                                        style={{ backgroundColor: `${catCfg.color}20`, borderColor: `${catCfg.color}40` }}>
                                        <span className="text-lg">{catCfg.icon}</span>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Category</div>
                                        <div className="text-white font-semibold text-sm">{catCfg.label}</div>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Reported</span>
                                        <span className="text-slate-300">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                                    </div>
                                    {item.dateOccurred && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">{isLost ? 'Date Lost' : 'Date Found'}</span>
                                            <span className="text-slate-300">{item.dateOccurred}</span>
                                        </div>
                                    )}
                                    {item.claimedAt && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Claimed</span>
                                            <span className="text-amber-400">{new Date(item.claimedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column — Details */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Title */}
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white mb-1">{item.title}</h2>
                                    {item.location && (
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {item.location}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-5">
                                    <h3 className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Description</h3>
                                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                                </div>

                                {/* Reporter & Contact Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-5">
                                        <h3 className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Reported By</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                {item.reportedByUserName?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold text-sm">{item.reportedByUserName}</div>
                                                <div className="text-slate-500 text-xs">{item.reportedByUserEmail}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-5">
                                        <h3 className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Contact Info</h3>
                                        {item.contactEmail && (
                                            <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                                                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {item.contactEmail}
                                            </div>
                                        )}
                                        {item.contactPhone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {item.contactPhone}
                                            </div>
                                        )}
                                        {!item.contactEmail && !item.contactPhone && (
                                            <span className="text-slate-500 text-sm">No contact info provided</span>
                                        )}
                                    </div>
                                </div>

                                {/* Claimed Info */}
                                {item.status === 'CLAIMED' && item.claimedByUserName && (
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                                        <h3 className="text-xs text-amber-400 mb-3 uppercase tracking-wider font-bold flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Claimed By
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                                                {item.claimedByUserName?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold text-sm">{item.claimedByUserName}</div>
                                                {item.claimedAt && <div className="text-slate-500 text-xs">{new Date(item.claimedAt).toLocaleString()}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Admin Notes */}
                                {item.adminNotes && (
                                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                                        <h3 className="text-xs text-blue-400 mb-2 uppercase tracking-wider font-bold">Admin Notes</h3>
                                        <p className="text-slate-300 text-sm">{item.adminNotes}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    {item.status !== 'CLOSED' && !showClosePanel && (
                                        <button
                                            onClick={() => setShowClosePanel(true)}
                                            className="px-6 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/20 transition-colors cursor-pointer"
                                        >
                                            Close Item
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-colors cursor-pointer"
                                    >
                                        Delete Item
                                    </button>
                                </div>

                                {/* Close Panel */}
                                {showClosePanel && item.status !== 'CLOSED' && (
                                    <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-5 space-y-3">
                                        <h3 className="text-sm font-bold text-white">Close this item</h3>
                                        <textarea
                                            value={closeNotes}
                                            onChange={(e) => setCloseNotes(e.target.value)}
                                            placeholder="Add admin notes (optional)..."
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none opacity-100"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleClose(item.id)}
                                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                                            >
                                                Confirm Close
                                            </button>
                                            <button
                                                onClick={() => { setShowClosePanel(false); setCloseNotes(''); }}
                                                className="px-6 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── LIST VIEW ───────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Lost & Found</h1>
                    <p className="text-slate-400 text-sm mt-0.5">Review, manage, and close reported items.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer scheme-dark outline-none">
                        <option value="">All Types</option>
                        <option value="LOST">🔍 Lost</option>
                        <option value="FOUND">📦 Found</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer scheme-dark outline-none">
                        <option value="">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="CLAIMED">Claimed</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <div className="px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-semibold">
                        {items.length} Items
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-52 bg-slate-800/50 rounded-2xl border border-slate-700/50 animate-pulse"></div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-slate-300 mb-2">No Items Found</h3>
                    <p className="text-slate-500 text-sm">There are no lost or found items matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {items.map(item => {
                        const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.OTHER;
                        const statusCfg = STATUS_BADGE[item.status] || STATUS_BADGE.OPEN;
                        const isLost = item.type === 'LOST';

                        return (
                            <button
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="text-left bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer group flex flex-col"
                            >
                                {/* Image or Placeholder */}
                                {item.imageUrl ? (
                                    <div className="h-36 overflow-hidden">
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ) : (
                                    <div className="h-24 flex items-center justify-center" style={{ backgroundColor: `${catCfg.color}08` }}>
                                        <span className="text-4xl opacity-60">{catCfg.icon}</span>
                                    </div>
                                )}

                                <div className="p-4 flex-1 flex flex-col">
                                    {/* Type + Status */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${isLost ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                                            {isLost ? 'Lost' : 'Found'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                                            {statusCfg.label}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                    <p className="text-slate-500 text-xs mt-1 line-clamp-2 flex-1">{item.description}</p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-700/50 pt-2.5 mt-3">
                                        <div className="flex items-center gap-1 truncate">
                                            <div className="w-4 h-4 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold" style={{ fontSize: '6px' }}>
                                                {item.reportedByUserName?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="truncate">{item.reportedByUserName}</span>
                                        </div>
                                        <span>{item.location || '—'}</span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
