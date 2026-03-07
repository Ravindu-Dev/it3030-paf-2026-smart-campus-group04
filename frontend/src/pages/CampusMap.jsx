import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllFacilities } from '../services/facilityService';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────── Constants ──────────────────────────── */

const TYPE_CONFIG = {
    LECTURE_HALL: { label: 'Lecture Hall', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: '🏛️' },
    LAB: { label: 'Laboratory', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', icon: '🔬' },
    MEETING_ROOM: { label: 'Meeting Room', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '🤝' },
    PROJECTOR: { label: 'Projector', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '📽️' },
    CAMERA: { label: 'Camera', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '📷' },
    OTHER_EQUIPMENT: { label: 'Equipment', color: '#6366f1', bg: 'rgba(99,102,241,0.15)', icon: '🔧' },
};

const STATUS_CONFIG = {
    ACTIVE: { label: 'Available', color: '#10b981', pulse: true },
    OUT_OF_SERVICE: { label: 'Out of Service', color: '#ef4444', pulse: false },
};

/* ──────── Default map coordinates for demo when facilities lack mapX/mapY ──────── */
const DEFAULT_POSITIONS = [
    { mapX: 22, mapY: 28 }, { mapX: 38, mapY: 22 }, { mapX: 55, mapY: 30 },
    { mapX: 72, mapY: 25 }, { mapX: 18, mapY: 55 }, { mapX: 35, mapY: 50 },
    { mapX: 52, mapY: 58 }, { mapX: 70, mapY: 52 }, { mapX: 25, mapY: 75 },
    { mapX: 45, mapY: 78 }, { mapX: 65, mapY: 72 }, { mapX: 80, mapY: 42 },
    { mapX: 15, mapY: 40 }, { mapX: 85, mapY: 65 }, { mapX: 50, mapY: 42 },
];

/* ─────────────────────────── Main Component ──────────────────────────── */

export default function CampusMap() {
    const { isAuthenticated } = useAuth();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [hoveredFacility, setHoveredFacility] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            const res = await getAllFacilities({ status: 'ACTIVE' });
            const data = res.data?.data || [];
            // Assign default positions to facilities without mapX/mapY
            const withPositions = data.map((f, i) => ({
                ...f,
                mapX: f.mapX ?? DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length].mapX,
                mapY: f.mapY ?? DEFAULT_POSITIONS[i % DEFAULT_POSITIONS.length].mapY,
            }));
            setFacilities(withPositions);
        } catch (err) {
            console.error('Failed to fetch facilities:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFacilities = activeFilter === 'ALL'
        ? facilities
        : facilities.filter(f => f.type === activeFilter);

    const handleMarkerClick = (facility) => {
        setSelectedFacility(prev => prev?.id === facility.id ? null : facility);
    };

    const handleMapClick = (e) => {
        if (e.target === mapRef.current || e.target.closest('.campus-svg-bg')) {
            setSelectedFacility(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-lg">Loading campus map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 pt-24 pb-16 selection:bg-blue-500/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-blue-600/8 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-40 -left-40 w-[40rem] h-[40rem] bg-purple-600/8 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-blue-300 text-sm font-medium mb-4">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live Campus Overview
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
                        Interactive{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                            Campus Map
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Explore campus facilities, check real-time availability, and book resources directly from the map.
                    </p>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    <FilterButton
                        label="All Facilities"
                        icon="🏫"
                        active={activeFilter === 'ALL'}
                        onClick={() => setActiveFilter('ALL')}
                        color="#64748b"
                    />
                    {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                        <FilterButton
                            key={type}
                            label={config.label}
                            icon={config.icon}
                            active={activeFilter === type}
                            onClick={() => setActiveFilter(type)}
                            color={config.color}
                        />
                    ))}
                </div>

                {/* Map Container */}
                <div
                    ref={mapRef}
                    className="relative bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/30"
                    onClick={handleMapClick}
                    style={{ minHeight: '600px' }}
                >
                    {/* SVG Campus Map Background */}
                    <svg
                        viewBox="0 0 1000 600"
                        className="w-full h-auto campus-svg-bg"
                        preserveAspectRatio="xMidYMid meet"
                        style={{ minHeight: '600px' }}
                    >
                        <defs>
                            {/* Building gradient */}
                            <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#334155" />
                                <stop offset="100%" stopColor="#1e293b" />
                            </linearGradient>
                            {/* Road gradient */}
                            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#475569" />
                                <stop offset="100%" stopColor="#374151" />
                            </linearGradient>
                            {/* Tree gradient */}
                            <radialGradient id="treeGrad">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.2" />
                            </radialGradient>
                            {/* Water gradient */}
                            <radialGradient id="waterGrad">
                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
                            </radialGradient>
                            {/* Grid pattern */}
                            <pattern id="gridPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
                            </pattern>
                        </defs>

                        {/* Background */}
                        <rect width="1000" height="600" fill="#0f172a" />
                        <rect width="1000" height="600" fill="url(#gridPattern)" />

                        {/* ── Campus Grounds ─────────────────────── */}
                        {/* Main campus area */}
                        <rect x="50" y="40" width="900" height="520" rx="20" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

                        {/* ── Roads ────────────────────────────── */}
                        {/* Main horizontal road */}
                        <rect x="50" y="280" width="900" height="40" fill="#334155" rx="3" />
                        <line x1="50" y1="300" x2="950" y2="300" stroke="#475569" strokeWidth="2" strokeDasharray="20,15" />
                        {/* Main vertical road */}
                        <rect x="480" y="40" width="40" height="520" fill="#334155" rx="3" />
                        <line x1="500" y1="40" x2="500" y2="560" stroke="#475569" strokeWidth="2" strokeDasharray="20,15" />
                        {/* Secondary roads */}
                        <rect x="250" y="140" width="20" height="160" fill="#2d3748" rx="2" />
                        <rect x="730" y="320" width="20" height="160" fill="#2d3748" rx="2" />

                        {/* ── Buildings ────────────────────────── */}
                        {/* Academic Block A (top-left) */}
                        <rect x="90" y="70" width="140" height="90" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="160" y="105" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">ACADEMIC</text>
                        <text x="160" y="122" textAnchor="middle" fill="#64748b" fontSize="10">Block A</text>

                        {/* Science Complex (top-center) */}
                        <rect x="310" y="60" width="150" height="100" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="385" y="100" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">SCIENCE</text>
                        <text x="385" y="117" textAnchor="middle" fill="#64748b" fontSize="10">Complex</text>

                        {/* Engineering Block (top-right) */}
                        <rect x="550" y="65" width="160" height="95" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="630" y="102" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">ENGINEERING</text>
                        <text x="630" y="119" textAnchor="middle" fill="#64748b" fontSize="10">Block</text>

                        {/* Admin Building (far right) */}
                        <rect x="780" y="80" width="130" height="80" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="845" y="112" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">ADMIN</text>
                        <text x="845" y="129" textAnchor="middle" fill="#64748b" fontSize="10">Building</text>

                        {/* Library (left-center) */}
                        <rect x="80" y="185" width="150" height="80" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="155" y="218" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">LIBRARY</text>
                        <text x="155" y="235" textAnchor="middle" fill="#64748b" fontSize="10">Main</text>

                        {/* Student Center (right-center) */}
                        <rect x="550" y="190" width="140" height="75" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="620" y="222" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">STUDENT</text>
                        <text x="620" y="239" textAnchor="middle" fill="#64748b" fontSize="10">Center</text>

                        {/* IT Center (bottom-left) */}
                        <rect x="100" y="340" width="130" height="85" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="165" y="375" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">IT CENTER</text>
                        <text x="165" y="392" textAnchor="middle" fill="#64748b" fontSize="10">Tech Hub</text>

                        {/* Arts & Media (bottom-center-left) */}
                        <rect x="280" y="350" width="140" height="80" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="350" y="383" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">ARTS &</text>
                        <text x="350" y="400" textAnchor="middle" fill="#64748b" fontSize="10">Media</text>

                        {/* Research Lab (bottom-center-right) */}
                        <rect x="550" y="340" width="150" height="85" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="625" y="375" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">RESEARCH</text>
                        <text x="625" y="392" textAnchor="middle" fill="#64748b" fontSize="10">Laboratory</text>

                        {/* Sports Complex (far bottom-right) */}
                        <rect x="770" y="340" width="150" height="90" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="845" y="378" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">SPORTS</text>
                        <text x="845" y="395" textAnchor="middle" fill="#64748b" fontSize="10">Complex</text>

                        {/* Auditorium (bottom) */}
                        <rect x="280" y="470" width="180" height="75" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="370" y="502" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">AUDITORIUM</text>
                        <text x="370" y="519" textAnchor="middle" fill="#64748b" fontSize="10">Main Hall</text>

                        {/* Cafeteria (bottom-right) */}
                        <rect x="590" y="465" width="120" height="70" rx="8" fill="url(#buildingGrad)" stroke="#475569" strokeWidth="1" />
                        <text x="650" y="495" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">CAFETERIA</text>
                        <text x="650" y="512" textAnchor="middle" fill="#64748b" fontSize="10">Food Court</text>

                        {/* ── Green Areas / Trees ────────────────── */}
                        {[
                            [300, 195], [320, 210], [440, 105], [470, 95],
                            [740, 145], [760, 160], [120, 480], [140, 495],
                            [850, 470], [870, 485], [200, 330], [470, 460],
                        ].map(([cx, cy], i) => (
                            <circle key={`tree-${i}`} cx={cx} cy={cy} r={12 + (i % 3) * 3} fill="url(#treeGrad)" />
                        ))}

                        {/* ── Water Feature / Pond ────────────────── */}
                        <ellipse cx="800" cy="260" rx="55" ry="30" fill="url(#waterGrad)" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.3" />
                        <text x="800" y="265" textAnchor="middle" fill="#38bdf8" fontSize="9" fillOpacity="0.6">Pond</text>

                        {/* ── Parking Areas ──────────────────────── */}
                        <rect x="85" y="490" width="120" height="55" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                        <text x="145" y="522" textAnchor="middle" fill="#475569" fontSize="10">P — Parking</text>

                        <rect x="770" y="475" width="140" height="55" rx="5" fill="#1e293b" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                        <text x="840" y="507" textAnchor="middle" fill="#475569" fontSize="10">P — Parking</text>

                        {/* ── Pathways (walking) ──────────────────── */}
                        <path d="M230 115 Q270 140 270 185" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" strokeOpacity="0.5" />
                        <path d="M460 160 Q470 200 470 280" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" strokeOpacity="0.5" />
                        <path d="M710 115 Q740 140 740 280" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" strokeOpacity="0.5" />
                        <path d="M230 340 Q250 320 280 320" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" strokeOpacity="0.5" />

                        {/* ── Entrance Gate ──────────────────────── */}
                        <rect x="440" y="570" width="120" height="25" rx="4" fill="#334155" stroke="#475569" strokeWidth="1" />
                        <text x="500" y="587" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">MAIN ENTRANCE</text>
                    </svg>

                    {/* ── Facility Markers (HTML overlay on top of SVG) ──────────── */}
                    <div className="absolute inset-0 pointer-events-none">
                        {filteredFacilities.map((facility) => {
                            const config = TYPE_CONFIG[facility.type] || TYPE_CONFIG.OTHER_EQUIPMENT;
                            const statusConfig = STATUS_CONFIG[facility.status] || STATUS_CONFIG.ACTIVE;
                            const isSelected = selectedFacility?.id === facility.id;
                            const isHovered = hoveredFacility?.id === facility.id;

                            return (
                                <div
                                    key={facility.id}
                                    className="absolute pointer-events-auto cursor-pointer transition-all duration-300"
                                    style={{
                                        left: `${facility.mapX}%`,
                                        top: `${facility.mapY}%`,
                                        transform: `translate(-50%, -50%) scale(${isSelected || isHovered ? 1.3 : 1})`,
                                        zIndex: isSelected ? 50 : isHovered ? 40 : 10,
                                    }}
                                    onClick={(e) => { e.stopPropagation(); handleMarkerClick(facility); }}
                                    onMouseEnter={() => setHoveredFacility(facility)}
                                    onMouseLeave={() => setHoveredFacility(null)}
                                >
                                    {/* Pulse ring */}
                                    {statusConfig.pulse && (
                                        <div
                                            className="absolute inset-0 rounded-full animate-ping opacity-30"
                                            style={{
                                                backgroundColor: config.color,
                                                width: '36px', height: '36px',
                                                top: '-2px', left: '-2px',
                                            }}
                                        />
                                    )}

                                    {/* Marker dot */}
                                    <div
                                        className="relative w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300"
                                        style={{
                                            backgroundColor: config.bg,
                                            borderColor: config.color,
                                            boxShadow: `0 0 ${isSelected ? '20px' : '10px'} ${config.color}40`,
                                        }}
                                    >
                                        <span className="text-sm">{config.icon}</span>
                                    </div>

                                    {/* Hover label */}
                                    {(isHovered && !isSelected) && (
                                        <div className="absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap px-3 py-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl text-xs text-white font-medium shadow-xl pointer-events-none">
                                            {facility.name}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Selected Facility Popup ──────────────────────────── */}
                    {selectedFacility && (
                        <FacilityPopup
                            facility={selectedFacility}
                            onClose={() => setSelectedFacility(null)}
                            isAuthenticated={isAuthenticated}
                        />
                    )}
                </div>

                {/* Legend + Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Legend */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Map Legend
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                                const count = facilities.filter(f => f.type === type).length;
                                return (
                                    <div key={type} className="flex items-center gap-2.5">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center border shrink-0"
                                            style={{ backgroundColor: config.bg, borderColor: config.color }}
                                        >
                                            <span className="text-[10px]">{config.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-300 text-xs font-medium leading-none">{config.label}</p>
                                            <p className="text-slate-500 text-[10px] mt-0.5">{count} available</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Campus Stats
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <StatCard label="Total Facilities" value={facilities.length} color="#3b82f6" />
                            <StatCard label="Active" value={facilities.filter(f => f.status === 'ACTIVE').length} color="#10b981" />
                            <StatCard
                                label="Total Capacity"
                                value={facilities.reduce((sum, f) => sum + (f.capacity || 0), 0).toLocaleString()}
                                color="#a855f7"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────── Sub-components ──────────────────────────── */

function FilterButton({ label, icon, active, onClick, color }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border cursor-pointer ${active
                ? 'text-white shadow-lg -translate-y-0.5'
                : 'text-slate-400 border-slate-700 bg-slate-800/40 hover:bg-slate-800/60 hover:text-white hover:border-slate-600'
                }`}
            style={active ? {
                backgroundColor: `${color}20`,
                borderColor: `${color}60`,
                boxShadow: `0 4px 15px ${color}25`,
            } : {}}
        >
            <span className="text-base">{icon}</span>
            {label}
            {active && (
                <span className="w-1.5 h-1.5 rounded-full ml-1" style={{ backgroundColor: color }}></span>
            )}
        </button>
    );
}

function FacilityPopup({ facility, onClose, isAuthenticated }) {
    const config = TYPE_CONFIG[facility.type] || TYPE_CONFIG.OTHER_EQUIPMENT;
    const statusConfig = STATUS_CONFIG[facility.status] || STATUS_CONFIG.ACTIVE;

    return (
        <div
            className="absolute z-50 pointer-events-auto"
            style={{
                left: `${Math.min(Math.max(facility.mapX, 15), 85)}%`,
                top: `${Math.min(Math.max(facility.mapY, 10), 80)}%`,
                transform: 'translate(-50%, -110%)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/50 w-72 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-5 pt-4 pb-3 border-b border-slate-700/50" style={{ background: `linear-gradient(135deg, ${config.bg}, transparent)` }}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-md"
                                style={{ backgroundColor: config.bg, borderColor: config.color }}
                            >
                                <span className="text-lg">{config.icon}</span>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm leading-tight">{facility.name}</h4>
                                <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-medium">Status</span>
                        <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ color: statusConfig.color, backgroundColor: `${statusConfig.color}15`, border: `1px solid ${statusConfig.color}30` }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusConfig.color }}></span>
                            {statusConfig.label}
                        </span>
                    </div>

                    {/* Location */}
                    {facility.location && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs font-medium">Location</span>
                            <span className="text-slate-300 text-xs">{facility.location}</span>
                        </div>
                    )}

                    {/* Capacity */}
                    {facility.capacity && (
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-xs font-medium">Capacity</span>
                            <span className="text-slate-300 text-xs font-semibold">{facility.capacity} seats</span>
                        </div>
                    )}

                    {/* Description */}
                    {facility.description && (
                        <p className="text-slate-500 text-xs leading-relaxed border-t border-slate-700/50 pt-3 line-clamp-2">
                            {facility.description}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                        <Link
                            to={`/facilities/${facility.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            {isAuthenticated ? 'Book Now' : 'View Details'}
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* Arrow pointer */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-slate-900/95 border-r border-b border-slate-700/80 rotate-45"></div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="text-center p-3 rounded-xl border border-slate-700/30 bg-slate-800/30">
            <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-slate-500 text-[10px] font-medium mt-1 uppercase tracking-wider">{label}</p>
        </div>
    );
}
