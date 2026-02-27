import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFacilityById } from '../services/facilityService';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
    LECTURE_HALL: 'Lecture Hall',
    LAB: 'Lab',
    MEETING_ROOM: 'Meeting Room',
    PROJECTOR: 'Projector',
    CAMERA: 'Camera',
    OTHER_EQUIPMENT: 'Other Equipment',
};

const TYPE_ICONS = {
    LECTURE_HALL: '🏫',
    LAB: '🔬',
    MEETING_ROOM: '🤝',
    PROJECTOR: '📽️',
    CAMERA: '📷',
    OTHER_EQUIPMENT: '🔧',
};

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function FacilityDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [facility, setFacility] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const res = await getFacilityById(id);
                setFacility(res.data.data);
            } catch (err) {
                toast.error('Facility not found');
                navigate('/facilities');
            } finally {
                setLoading(false);
            }
        };
        fetchFacility();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!facility) return null;

    const isActive = facility.status === 'ACTIVE';
    const sortedWindows = [...(facility.availabilityWindows || [])].sort(
        (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back link */}
                <Link
                    to="/facilities"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m12 19-7-7 7-7" />
                        <path d="M19 12H5" />
                    </svg>
                    Back to Facilities
                </Link>

                {/* Hero section */}
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                    {/* Image */}
                    <div className="h-56 sm:h-72 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative">
                        {facility.imageUrl ? (
                            <img
                                src={facility.imageUrl}
                                alt={facility.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-7xl opacity-40">
                                {TYPE_ICONS[facility.type] || '🏢'}
                            </span>
                        )}

                        {/* Status badge */}
                        <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold ${isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {isActive ? '● Active' : '● Out of Service'}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Title + Type */}
                        <div>
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                                {TYPE_LABELS[facility.type] || facility.type}
                            </span>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">
                                {facility.name}
                            </h1>
                        </div>

                        {/* Description */}
                        {facility.description && (
                            <p className="text-slate-400 leading-relaxed">
                                {facility.description}
                            </p>
                        )}

                        {/* Meta grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <MetaCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                }
                                label="Location"
                                value={facility.location}
                            />
                            {facility.capacity && (
                                <MetaCard
                                    icon={
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    }
                                    label="Capacity"
                                    value={`${facility.capacity} seats`}
                                />
                            )}
                            <MetaCard
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                        <line x1="16" x2="16" y1="2" y2="6" />
                                        <line x1="8" x2="8" y1="2" y2="6" />
                                        <line x1="3" x2="21" y1="10" y2="10" />
                                    </svg>
                                }
                                label="Created"
                                value={facility.createdAt ? new Date(facility.createdAt).toLocaleDateString() : 'N/A'}
                            />
                        </div>

                        {/* Availability Windows */}
                        {sortedWindows.length > 0 && (
                            <div>
                                <h2 className="text-white font-semibold text-lg mb-3">
                                    Availability Schedule
                                </h2>
                                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-600/30">
                                                <th className="px-4 py-3 text-left font-medium text-slate-400">Day</th>
                                                <th className="px-4 py-3 text-left font-medium text-slate-400">Start</th>
                                                <th className="px-4 py-3 text-left font-medium text-slate-400">End</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedWindows.map((w, i) => (
                                                <tr key={i} className="border-b border-slate-600/20 last:border-b-0">
                                                    <td className="px-4 py-2.5 text-white font-medium capitalize">
                                                        {w.dayOfWeek?.toLowerCase()}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-slate-300">{w.startTime}</td>
                                                    <td className="px-4 py-2.5 text-slate-300">{w.endTime}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* User booking action */}
                        {user?.role !== 'ADMIN' && isActive && (
                            <div className="pt-2">
                                <Link
                                    to={`/bookings/new?facilityId=${facility.id}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    Book This Resource
                                </Link>
                            </div>
                        )}

                        {/* Admin actions */}
                        {user?.role === 'ADMIN' && (
                            <div className="pt-2">
                                <Link
                                    to="/admin/facilities"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                    </svg>
                                    Manage in Admin Panel
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetaCard({ icon, label, value }) {
    return (
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 space-y-1.5">
            <div className="text-blue-400">{icon}</div>
            <div className="text-slate-500 text-xs font-medium">{label}</div>
            <div className="text-white text-sm font-medium">{value}</div>
        </div>
    );
}
