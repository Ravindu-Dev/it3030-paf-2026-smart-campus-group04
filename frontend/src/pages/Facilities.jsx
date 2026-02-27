import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllFacilities } from '../services/facilityService';
import toast from 'react-hot-toast';

// ─── Type / Status labels ────────────────────────────────────────────
const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'LECTURE_HALL', label: 'Lecture Hall' },
    { value: 'LAB', label: 'Lab' },
    { value: 'MEETING_ROOM', label: 'Meeting Room' },
    { value: 'PROJECTOR', label: 'Projector' },
    { value: 'CAMERA', label: 'Camera' },
    { value: 'OTHER_EQUIPMENT', label: 'Other Equipment' },
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

const TYPE_ICONS = {
    LECTURE_HALL: '🏫',
    LAB: '🔬',
    MEETING_ROOM: '🤝',
    PROJECTOR: '📽️',
    CAMERA: '📷',
    OTHER_EQUIPMENT: '🔧',
};

const TYPE_LABELS = {
    LECTURE_HALL: 'Lecture Hall',
    LAB: 'Lab',
    MEETING_ROOM: 'Meeting Room',
    PROJECTOR: 'Projector',
    CAMERA: 'Camera',
    OTHER_EQUIPMENT: 'Other Equipment',
};

// ─── Main Page ───────────────────────────────────────────────────────

export default function Facilities() {
    const { user } = useAuth();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [minCapacity, setMinCapacity] = useState('');

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            if (locationFilter) params.location = locationFilter;
            if (minCapacity) params.minCapacity = parseInt(minCapacity);

            const res = await getAllFacilities(params);
            setFacilities(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load facilities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, [typeFilter, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFacilities();
    };

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStatusFilter('');
        setLocationFilter('');
        setMinCapacity('');
        setTimeout(() => fetchFacilities(), 0);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Facilities & Assets
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Browse and find available campus resources
                        </p>
                    </div>
                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/admin/facilities"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            Manage Facilities
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Search bar */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                            >
                                Search
                            </button>
                        </div>

                        {/* Filter row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none"
                            >
                                {TYPE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Location..."
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                onBlur={fetchFacilities}
                                className="px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />

                            <input
                                type="number"
                                placeholder="Min capacity..."
                                value={minCapacity}
                                onChange={(e) => setMinCapacity(e.target.value)}
                                onBlur={fetchFacilities}
                                min="0"
                                className="px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>

                        {/* Active filters indicator */}
                        {(search || typeFilter || statusFilter || locationFilter || minCapacity) && (
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs">Active filters</span>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-slate-500 text-sm mb-4">
                        {facilities.length} {facilities.length === 1 ? 'resource' : 'resources'} found
                    </p>
                )}

                {/* Facilities Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : facilities.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🏗️</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No facilities found</h3>
                        <p className="text-slate-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {facilities.map(facility => (
                            <FacilityCard key={facility.id} facility={facility} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Facility Card ───────────────────────────────────────────────────

function FacilityCard({ facility }) {
    const isActive = facility.status === 'ACTIVE';

    return (
        <Link
            to={`/facilities/${facility.id}`}
            className="group block bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
        >
            {/* Image or placeholder */}
            <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative overflow-hidden">
                {facility.imageUrl ? (
                    <img
                        src={facility.imageUrl}
                        alt={facility.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-300">
                        {TYPE_ICONS[facility.type] || '🏢'}
                    </span>
                )}

                {/* Status badge */}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                    {isActive ? 'Active' : 'Out of Service'}
                </span>

                {/* Type badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-xs font-medium text-slate-300 border border-slate-600/30">
                    {TYPE_LABELS[facility.type] || facility.type}
                </span>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
                <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors leading-tight">
                    {facility.name}
                </h3>

                {facility.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">
                        {facility.description}
                    </p>
                )}

                <div className="flex items-center gap-4 pt-1">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        {facility.location}
                    </div>

                    {/* Capacity */}
                    {facility.capacity && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {facility.capacity} seats
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
