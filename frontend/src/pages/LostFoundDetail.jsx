import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLostFoundItemById, claimLostFoundItem } from '../services/lostFoundService';
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

export default function LostFoundDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => { fetchItem(); }, [id]);

    const fetchItem = async () => {
        try {
            const res = await getLostFoundItemById(id);
            setItem(res.data?.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load item.');
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!user) { toast.error('Please log in to claim.'); return; }
        setClaiming(true);
        try {
            const res = await claimLostFoundItem(id);
            setItem(res.data?.data);
            toast.success('Item claimed successfully! The reporter has been notified.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to claim item.');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 pt-28 pb-16 px-4 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-slate-900 pt-28 pb-16 px-4 text-center">
                <h2 className="text-2xl font-bold text-white">Item Not Found</h2>
                <Link to="/lost-found" className="text-amber-400 underline mt-4 inline-block">Back to Lost & Found</Link>
            </div>
        );
    }

    const catCfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.OTHER;
    const statusCfg = STATUS_BADGE[item.status] || STATUS_BADGE.OPEN;
    const isLost = item.type === 'LOST';

    return (
        <div className="min-h-screen bg-slate-900 pt-28 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back button */}
                <Link to="/lost-found" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Lost & Found
                </Link>

                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl overflow-hidden">
                    {/* Type / Status Header */}
                    <div className={`px-6 py-4 flex items-center justify-between ${isLost ? 'bg-red-500/10 border-b border-red-500/20' : 'bg-emerald-500/10 border-b border-emerald-500/20'}`}>
                        <span className={`text-sm font-bold uppercase tracking-wider ${isLost ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isLost ? '🔍 Lost Item' : '📦 Found Item'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                            {statusCfg.label}
                        </span>
                    </div>

                    {/* Image */}
                    {item.imageUrl && (
                        <div className="border-b border-slate-700/50">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-64 object-cover" />
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
                                <h1 className="text-2xl font-extrabold text-white">{item.title}</h1>
                                <span className="text-sm font-medium" style={{ color: catCfg.color }}>{catCfg.label}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Description</h3>
                            <p className="text-slate-300 leading-relaxed">{item.description}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {item.location && (
                                <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Location</div>
                                    <div className="text-white font-semibold flex items-center gap-2">
                                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {item.location}
                                    </div>
                                </div>
                            )}
                            {item.dateOccurred && (
                                <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Date</div>
                                    <div className="text-white font-semibold">{item.dateOccurred}</div>
                                </div>
                            )}
                            <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Reported By</div>
                                <div className="text-white font-semibold">{item.reportedByUserName}</div>
                            </div>
                            {item.contactEmail && (
                                <div className="bg-slate-900/40 border border-slate-700/40 rounded-xl p-4">
                                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Contact</div>
                                    <div className="text-white font-semibold text-sm">{item.contactEmail}</div>
                                </div>
                            )}
                        </div>

                        {/* Claimed info */}
                        {item.status === 'CLAIMED' && item.claimedByUserName && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <div className="text-xs text-amber-400 mb-1 uppercase tracking-wide font-bold">Claimed By</div>
                                <div className="text-white font-semibold">{item.claimedByUserName}</div>
                                {item.claimedAt && <div className="text-slate-400 text-xs mt-1">{new Date(item.claimedAt).toLocaleString()}</div>}
                            </div>
                        )}

                        {/* Admin notes */}
                        {item.adminNotes && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <div className="text-xs text-blue-400 mb-1 uppercase tracking-wide font-bold">Admin Notes</div>
                                <p className="text-slate-300">{item.adminNotes}</p>
                            </div>
                        )}

                        {/* Claim Button */}
                        {item.status === 'OPEN' && user && user.id !== item.reportedByUserId && (
                            <button
                                onClick={handleClaim}
                                disabled={claiming}
                                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                            >
                                {claiming ? 'Claiming...' : isLost ? '🙋 I Found This Item — Claim' : '🙋 This Is Mine — Claim'}
                            </button>
                        )}

                        {!user && item.status === 'OPEN' && (
                            <Link
                                to="/login"
                                className="block w-full text-center py-3.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl font-medium transition-colors hover:bg-slate-700"
                            >
                                Log in to Claim This Item
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
