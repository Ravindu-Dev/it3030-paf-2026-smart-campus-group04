import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendations } from '../services/recommendationService';

const TYPE_CONFIG = {
    LECTURE_HALL: { label: 'Lecture Hall', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: '🏛️' },
    LAB: { label: 'Laboratory', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: '🔬' },
    MEETING_ROOM: { label: 'Meeting Room', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '🤝' },
    PROJECTOR: { label: 'Projector', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '📽️' },
    CAMERA: { label: 'Camera', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '📷' },
    OTHER_EQUIPMENT: { label: 'Equipment', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '🔧' },
};

export default function SmartRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const res = await getRecommendations();
            if (res.data && res.data.data) {
                setRecommendations(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch recommendations:", err);
            setError("Could not load recommendations at this time.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mb-8 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
                    <div className="h-6 w-48 bg-slate-800 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-800/50 rounded-2xl border border-slate-700/50"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <h3 className="text-red-400 font-bold mb-2">Recommendation System Offline</h3>
                <p className="text-red-300 text-sm">{error}</p>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="mb-8 p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                <h3 className="text-slate-300 font-bold mb-2">Smart Recommendations</h3>
                <p className="text-slate-400 text-sm">No recommendations available at this time.</p>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✨</span>
                <h2 className="text-xl font-bold text-white tracking-wide">
                    Smart Recommendations <span className="text-slate-400 text-sm font-medium">Just for you</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((rec, idx) => {
                    const facility = rec.facility;
                    const config = TYPE_CONFIG[facility.type] || TYPE_CONFIG.OTHER_EQUIPMENT;

                    return (
                        <div
                            key={facility.id || idx}
                            className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 flex flex-col"
                        >
                            {/* Decorative gradient blob */}
                            <div
                                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-300"
                                style={{ backgroundColor: config.color }}
                            ></div>

                            <div className="p-5 flex-1 flex flex-col relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md"
                                            style={{ backgroundColor: config.bg, borderColor: config.color }}
                                        >
                                            <span className="text-lg">{config.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-base leading-tight truncate w-32 sm:w-40">{facility.name}</h3>
                                            <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
                                        </div>
                                    </div>
                                    {facility.capacity && (
                                        <div className="text-xs font-semibold text-slate-300 bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-700/50">
                                            {facility.capacity} seats
                                        </div>
                                    )}
                                </div>

                                {/* AI Reason */}
                                <div className="mt-2 mb-4 flex-1">
                                    <div className="relative p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-xl">
                                        <div className="absolute -top-2 -left-2 text-indigo-400 opacity-50 text-xs">✨ AI</div>
                                        <p className="text-slate-300 text-xs leading-relaxed italic pl-2 border-l-2 border-indigo-500/50">
                                            "{rec.reason}"
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto pt-3 border-t border-slate-700/50">
                                    <Link
                                        to={`/facilities/${facility.id}`}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition-colors border border-slate-600/50 hover:border-slate-500"
                                    >
                                        View & Book
                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
