import { useState, useEffect } from 'react';
import transportService from '../services/transportService';
import toast from 'react-hot-toast';

export default function ManageTransport() {
    const [activeTab, setActiveTab] = useState('shuttles');
    const [shuttles, setShuttles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShuttle, setEditingShuttle] = useState(null);
    const [editingRoute, setEditingRoute] = useState(null);
    const [visibleShuttles, setVisibleShuttles] = useState(6);
    const [visibleRoutes, setVisibleRoutes] = useState(6);

    const [viewRatingsShuttle, setViewRatingsShuttle] = useState(null);
    const [shuttleRatings, setShuttleRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(false);

    const [activeAnnouncement, setActiveAnnouncement] = useState(null);
    const [announcementMessage, setAnnouncementMessage] = useState('');

    const [shuttleForm, setShuttleForm] = useState({ name: '', plateNumber: '', driverName: '', driverPhone: '', routeId: '', imageUrl: '' });
    const [routeForm, setRouteForm] = useState({ name: '', description: '', color: '#3b82f6', stops: [], schedule: [] });
    const [formErrors, setFormErrors] = useState({});

    const validateShuttleForm = () => {
        const errors = {};
        if (!shuttleForm.name || shuttleForm.name.trim().length < 2) errors.name = 'Shuttle name is required (min 2 chars)';
        else if (shuttleForm.name.length > 100) errors.name = 'Name must not exceed 100 characters';
        if (!shuttleForm.plateNumber || shuttleForm.plateNumber.trim().length < 2) errors.plateNumber = 'Plate number is required (min 2 chars)';
        else if (shuttleForm.plateNumber.length > 20) errors.plateNumber = 'Plate number must not exceed 20 characters';
        if (shuttleForm.driverPhone && !/^$|^[0-9+\-\s()]{7,20}$/.test(shuttleForm.driverPhone)) errors.driverPhone = 'Enter a valid phone number';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateRouteForm = () => {
        const errors = {};
        if (!routeForm.name || routeForm.name.trim().length < 2) errors.name = 'Route name is required (min 2 chars)';
        else if (routeForm.name.length > 100) errors.name = 'Name must not exceed 100 characters';
        if (routeForm.description && routeForm.description.length > 300) errors.description = 'Description must not exceed 300 characters';
        if (routeForm.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(routeForm.color)) errors.color = 'Invalid hex color';
        if (routeForm.stops && routeForm.stops.length > 0 && routeForm.stops.length < 2) errors.stops = 'A route needs at least 2 stops';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, rRes, aRes] = await Promise.all([
                transportService.getAllShuttles(), 
                transportService.getAllRoutes(),
                transportService.getActiveAnnouncement()
            ]);
            if (sRes.success) setShuttles(sRes.data);
            if (rRes.success) setRoutes(rRes.data);
            if (aRes && aRes.success) setActiveAnnouncement(aRes.data);
        } catch (e) { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleShuttleSubmit = async (e) => {
        e.preventDefault();
        if (!validateShuttleForm()) { toast.error('Please fix the errors'); return; }
        try {
            if (editingShuttle) {
                await transportService.updateShuttle(editingShuttle.id, shuttleForm);
                toast.success('Shuttle updated');
            } else {
                await transportService.createShuttle(shuttleForm);
                toast.success('Shuttle created');
            }
            setShowModal(false); setFormErrors({}); fetchData();
        } catch (e) {
            if (e.response?.data?.data && typeof e.response.data.data === 'object') {
                setFormErrors(e.response.data.data);
                toast.error('Validation failed — check highlighted fields');
            } else { toast.error(e.response?.data?.message || 'Failed'); }
        }
    };

    const handleRouteSubmit = async (e) => {
        e.preventDefault();
        if (!validateRouteForm()) { toast.error('Please fix the errors'); return; }
        try {
            if (editingRoute) {
                await transportService.updateRoute(editingRoute.id, routeForm);
                toast.success('Route updated');
            } else {
                await transportService.createRoute(routeForm);
                toast.success('Route created');
            }
            setShowModal(false); setFormErrors({}); fetchData();
        } catch (e) {
            if (e.response?.data?.data && typeof e.response.data.data === 'object') {
                setFormErrors(e.response.data.data);
                toast.error('Validation failed — check highlighted fields');
            } else { toast.error(e.response?.data?.message || 'Failed'); }
        }
    };

    const deleteShuttle = async (id) => {
        if (window.confirm('Delete this shuttle?')) {
            await transportService.deleteShuttle(id);
            toast.success('Deleted');
            fetchData();
        }
    };

    const deleteRoute = async (id) => {
        if (window.confirm('Delete this route?')) {
            await transportService.deleteRoute(id);
            toast.success('Deleted');
            fetchData();
        }
    };

    const copyTrackingLink = (token) => {
        // Auto-replace localhost with network IP so links work on phones
        let origin = window.location.origin;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            origin = origin.replace(window.location.hostname, '10.127.0.172');
        }
        const link = `${origin}/track/${token}`;
        navigator.clipboard.writeText(link);
        toast.success('Tracking link copied! Send to driver 📱');
    };

    const openNewShuttle = () => {
        setEditingShuttle(null);
        setShuttleForm({ name: '', plateNumber: '', driverName: '', driverPhone: '', routeId: '', imageUrl: '' });
        setFormErrors({});
        setShowModal(true);
    };

    const openNewRoute = () => {
        setEditingRoute(null);
        setRouteForm({ name: '', description: '', color: '#3b82f6', stops: [], schedule: [] });
        setFormErrors({});
        setShowModal(true);
    };

    const addStop = () => {
        setRouteForm({ ...routeForm, stops: [...routeForm.stops, { name: '', latitude: 7.2906, longitude: 80.6337, orderIndex: routeForm.stops.length }] });
    };

    const openRatingsModal = async (shuttle) => {
        setViewRatingsShuttle(shuttle);
        setLoadingRatings(true);
        try {
            const res = await transportService.getShuttleRatings(shuttle.id);
            if (res.success) setShuttleRatings(res.data);
        } catch (e) {
            toast.error('Failed to load ratings');
        } finally {
            setLoadingRatings(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!announcementMessage.trim()) return;
        try {
            const res = await transportService.createAnnouncement(announcementMessage);
            if (res.success) {
                toast.success('Announcement broadcasted!');
                setActiveAnnouncement(res.data);
                setAnnouncementMessage('');
            }
        } catch (e) { toast.error('Failed to broadcast'); }
    };

    const clearAnnouncement = async () => {
        if (!activeAnnouncement) return;
        try {
            await transportService.deleteAnnouncement(activeAnnouncement.id);
            toast.success('Announcement cleared');
            setActiveAnnouncement(null);
        } catch (e) { toast.error('Failed to clear announcement'); }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 pt-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 -left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 -right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                
                {/* Announcement Bar */}
                <div className="bg-slate-800/60 backdrop-blur-xl border border-blue-500/30 p-5 rounded-2xl mb-8 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col md:flex-row gap-4 items-center justify-between animate-in slide-in-from-top-4 duration-500">
                    <div className="flex-1 w-full">
                        <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Live Broadcast Override
                        </p>
                        {activeAnnouncement ? (
                            <div className="flex items-center justify-between bg-slate-900/50 px-4 py-3 rounded-xl border border-blue-500/20">
                                <span className="text-white font-medium italic flex items-center gap-2">
                                    <span className="text-xl">📢</span> "{activeAnnouncement.message}"
                                </span>
                                <button onClick={clearAnnouncement} className="text-xs bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer font-bold shadow-sm">Clear Alert</button>
                            </div>
                        ) : (
                            <form onSubmit={handleBroadcast} className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Type an alert (e.g. Route A delayed by 10 mins)..." 
                                    className="flex-1 bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 shadow-inner"
                                    value={announcementMessage}
                                    onChange={e => setAnnouncementMessage(e.target.value)}
                                    maxLength={150}
                                />
                                <button type="submit" className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-95 whitespace-nowrap">Broadcast Live</button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
                            <span className="p-3 bg-blue-500/20 rounded-2xl text-blue-500 shadow-inner">🚌</span>
                            Transport <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">Logistics</span>
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium tracking-wide">Manage shuttles, define routes, and monitor live tracking assets.</p>
                    </div>
                    <button
                        onClick={activeTab === 'shuttles' ? openNewShuttle : openNewRoute}
                        className="group px-8 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] font-bold flex items-center gap-2.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add {activeTab === 'shuttles' ? 'New Shuttle' : 'New Route'}
                    </button>
                </div>

                {/* Tabs / Segment Control */}
                <div className="inline-flex p-1.5 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl mb-10 shadow-inner">
                    {['shuttles', 'routes'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-2.5 rounded-xl capitalize font-bold text-[13px] tracking-widest transition-all duration-300 ${activeTab === tab 
                                ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[1.02]' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">Loading...</div>
                ) : activeTab === 'shuttles' ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {shuttles.slice(0, visibleShuttles).map(shuttle => (
                                <div key={shuttle.id} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-7 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500 hover:shadow-blue-500/10">
                                    {/* Glass reflection */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-500"></div>

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="bg-linear-to-br from-blue-500/20 to-indigo-600/10 border border-blue-500/20 p-4 rounded-2xl text-3xl group-hover:scale-110 transition-transform duration-500 shadow-inner">🚌</div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{shuttle.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-blue-500/80 font-mono text-xs font-bold uppercase tracking-widest">{shuttle.plateNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingShuttle(shuttle); setShuttleForm({ ...shuttle }); setShowModal(true); }} className="p-2.5 bg-slate-900/50 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-500/30 rounded-xl text-slate-400 hover:text-blue-400 transition-all cursor-pointer" title="Edit Shuttle">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                            </button>
                                            <button onClick={() => deleteShuttle(shuttle.id)} className="p-2.5 bg-slate-900/50 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/30 rounded-xl text-slate-400 hover:text-red-500 transition-all cursor-pointer" title="Delete Shuttle">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-7 flex flex-wrap gap-4 relative z-10">
                                        <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/60 shadow-inner group-hover:border-slate-700/50 transition-colors">
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-0.5">Route Assigned</p>
                                            <span className="text-blue-400 font-bold text-sm">{routes.find(r => r.id === shuttle.routeId)?.name || 'Not assigned'}</span>
                                        </div>
                                        <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/60 shadow-inner group-hover:border-slate-700/50 transition-colors">
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-0.5">Primary Driver</p>
                                            <span className="text-slate-300 font-bold text-sm italic">{shuttle.driverName || 'None assigned'}</span>
                                        </div>
                                        <div className="bg-slate-900/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800/60 shadow-inner hover:border-yellow-500/30 transition-colors cursor-pointer" onClick={() => openRatingsModal(shuttle)}>
                                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-0.5">Driver Rating</p>
                                            <span className="text-yellow-500 font-bold text-sm">
                                                {shuttle.averageRating > 0 ? `⭐ ${shuttle.averageRating} (${shuttle.totalRatings})` : 'No ratings yet'}
                                            </span>
                                        </div>
                                        
                                        <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 transition-all duration-300 ${shuttle.tracking ? 'bg-green-500/5 border-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-slate-900/40 border-slate-800 text-slate-500 shadow-inner'}`}>
                                            <div className="relative flex h-3 w-3">
                                                {shuttle.tracking && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                                <span className={`relative inline-flex rounded-full h-3 w-3 ${shuttle.tracking ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]' : 'bg-slate-600'}`}></span>
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{shuttle.tracking ? 'Live Signal' : 'Signal Lost'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl flex items-center justify-between group-hover:border-blue-500/20 transition-all relative z-10 overflow-hidden shadow-inner">
                                        <div className="absolute inset-0 bg-blue-500/[0.02] pointer-events-none"></div>
                                        <div className="relative z-10 max-w-[65%]">
                                            <p className="text-[9px] uppercase font-black text-blue-500 tracking-[0.2em] mb-1">Encrypted Tracking Token</p>
                                            <p className="text-xs text-slate-500 font-mono truncate">{shuttle.trackingToken}</p>
                                        </div>
                                        <button 
                                            onClick={() => copyTrackingLink(shuttle.trackingToken)} 
                                            className="relative z-10 px-5 py-2 bg-blue-600/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg cursor-pointer border border-blue-500/20"
                                        >
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {shuttles.length > 6 && (
                            <div className="relative pt-10 pb-4">
                                {visibleShuttles < shuttles.length && (
                                    <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-t from-slate-950/80 to-transparent pointer-events-none -translate-y-full" />
                                )}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-xl shadow-2xl">
                                        {visibleShuttles < shuttles.length ? (
                                            <button 
                                                onClick={() => setVisibleShuttles(prev => Math.min(prev + 6, shuttles.length))}
                                                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                            >
                                                <span>View More Shuttles</span>
                                                <svg className="w-4 h-4 text-blue-500 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setVisibleShuttles(6)}
                                                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                            >
                                                <span>Collapse List</span>
                                                <svg className="w-4 h-4 text-blue-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="h-4 w-px bg-slate-800 mx-1" />
                                        <div className="px-4 py-1 flex items-center gap-2 font-mono">
                                            <span className="text-white text-xs font-bold">{Math.min(visibleShuttles, shuttles.length)}</span>
                                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-tighter">/</span>
                                            <span className="text-slate-500 text-xs font-medium">{shuttles.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {shuttles.length === 0 && <p className="text-slate-500 text-center py-10">No shuttles yet. Create one!</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 animate-in fade-in duration-700 slide-in-from-bottom-4">
                        {routes.slice(0, visibleRoutes).map(route => (
                            <div key={route.id} className="bg-slate-800/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col md:flex-row items-center justify-between hover:bg-slate-800/60 hover:border-blue-500/20 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 opacity-60" style={{ backgroundColor: route.color }}></div>
                                
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl border border-white/5" style={{ backgroundColor: `${route.color}20`, color: route.color }}>
                                        <span className="drop-shadow-sm">🗺️</span>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors">{route.name}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-lg border border-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-widest shadow-inner">
                                                <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: route.color, color: route.color }} />
                                                {route.stops?.length || 0} Critical Stops
                                            </div>
                                            <p className="text-slate-500 text-[11px] font-medium tracking-wide max-w-[200px] truncate">{route.description || 'No description listed'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 mt-6 md:mt-0 relative z-10">
                                    <button onClick={() => { setEditingRoute(route); setRouteForm({ ...route }); setShowModal(true); }} className="px-6 py-2.5 bg-slate-900/50 hover:bg-blue-500/20 border border-slate-800 hover:border-blue-500/30 rounded-2xl text-slate-300 hover:text-blue-400 font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer shadow-lg outline-none">
                                        Edit Alignment
                                    </button>
                                    <button onClick={() => deleteRoute(route.id)} className="px-3.5 py-2.5 bg-slate-900/50 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/30 rounded-2xl text-slate-500 hover:text-red-500 transition-all cursor-pointer group shadow-lg outline-none" title="Delete Route">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {routes.length > 6 && (
                            <div className="relative pt-10 pb-4">
                                {visibleRoutes < routes.length && (
                                    <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-t from-slate-950/80 to-transparent pointer-events-none -translate-y-full" />
                                )}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-xl shadow-2xl">
                                        {visibleRoutes < routes.length ? (
                                            <button 
                                                onClick={() => setVisibleRoutes(prev => Math.min(prev + 6, routes.length))}
                                                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                            >
                                                <span>View More Routes</span>
                                                <svg className="w-4 h-4 text-blue-500 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setVisibleRoutes(6)}
                                                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                            >
                                                <span>Collapse List</span>
                                                <svg className="w-4 h-4 text-blue-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="h-4 w-px bg-slate-800 mx-1" />
                                        <div className="px-4 py-1 flex items-center gap-2 font-mono">
                                            <span className="text-white text-xs font-bold">{Math.min(visibleRoutes, routes.length)}</span>
                                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-tighter">/</span>
                                            <span className="text-slate-500 text-xs font-medium">{routes.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {routes.length === 0 && <p className="text-slate-500 text-center py-10">No routes yet. Create one!</p>}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-slate-800/90 backdrop-blur-2xl rounded-[32px] border border-slate-700/50 p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 relative">
                            {/* Modal Close */}
                            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                    <span className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                                        {activeTab === 'shuttles' ? '🚌' : '🗺️'}
                                    </span>
                                    {editingShuttle || editingRoute ? 'Adjust' : 'Initialize'} {activeTab === 'shuttles' ? 'Shuttle' : 'Route'}
                                </h2>
                                <p className="text-slate-400 mt-2 font-medium">Please finalize the resource specifications below.</p>
                            </div>

                            {activeTab === 'shuttles' ? (
                                <form onSubmit={handleShuttleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Vehicle Identity</label>
                                            <input className={`w-full bg-slate-900/60 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-all ${formErrors.name ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`} placeholder="Shuttle Name *" required maxLength={100} value={shuttleForm.name} onChange={e => { setShuttleForm({ ...shuttleForm, name: e.target.value }); if (formErrors.name) setFormErrors(p => ({...p, name: ''})); }} />
                                            {formErrors.name && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.name}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Registration</label>
                                            <input className={`w-full bg-slate-900/60 border rounded-2xl px-5 py-4 uppercase text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-all ${formErrors.plateNumber ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`} placeholder="Plate Number *" required maxLength={20} value={shuttleForm.plateNumber} onChange={e => { setShuttleForm({ ...shuttleForm, plateNumber: e.target.value.toUpperCase() }); if (formErrors.plateNumber) setFormErrors(p => ({...p, plateNumber: ''})); }} />
                                            {formErrors.plateNumber && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.plateNumber}</p>}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Personnel</label>
                                            <input className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-all" placeholder="Driver Name" maxLength={100} value={shuttleForm.driverName || ''} onChange={e => setShuttleForm({ ...shuttleForm, driverName: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Contact Uplink</label>
                                            <input className={`w-full bg-slate-900/60 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-all ${formErrors.driverPhone ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`} placeholder="Phone Number" value={shuttleForm.driverPhone || ''} onChange={e => { setShuttleForm({ ...shuttleForm, driverPhone: e.target.value }); if (formErrors.driverPhone) setFormErrors(p => ({...p, driverPhone: ''})); }} />
                                            {formErrors.driverPhone && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.driverPhone}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Operational Corridor</label>
                                        <select className="w-full appearance-none bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-all cursor-pointer scheme-dark" value={shuttleForm.routeId || ''} onChange={e => setShuttleForm({ ...shuttleForm, routeId: e.target.value })}>
                                            <option value="">Select Operational Route</option>
                                            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex gap-4 pt-8">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer">Discard</button>
                                        <button type="submit" className="flex-1 px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                                            Deploy Configuration
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleRouteSubmit} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Corridor Designation</label>
                                        <input className={`w-full bg-slate-900/60 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-all ${formErrors.name ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`} placeholder="Route Name *" required maxLength={100} value={routeForm.name} onChange={e => { setRouteForm({ ...routeForm, name: e.target.value }); if (formErrors.name) setFormErrors(p => ({...p, name: ''})); }} />
                                        {formErrors.name && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.name}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Route Metadata</label>
                                            <span className={`text-[10px] ${(routeForm.description?.length || 0) > 250 ? 'text-amber-400' : 'text-slate-600'}`}>{routeForm.description?.length || 0}/300</span>
                                        </div>
                                        <input className={`w-full bg-slate-900/60 border rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-inner transition-all ${formErrors.description ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`} placeholder="Brief Description" maxLength={300} value={routeForm.description || ''} onChange={e => { setRouteForm({ ...routeForm, description: e.target.value }); if (formErrors.description) setFormErrors(p => ({...p, description: ''})); }} />
                                        {formErrors.description && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.description}</p>}
                                    </div>
                                    
                                    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Route Accent Color</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Used for maps and UI identification</p>
                                        </div>
                                        <input type="color" value={routeForm.color} onChange={e => setRouteForm({ ...routeForm, color: e.target.value })} className="w-16 h-12 rounded-xl cursor-pointer bg-transparent border-none outline-none shadow-2xl" />
                                    </div>

                                    {/* Stops */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em]">Assigned Waypoints</label>
                                            <button type="button" onClick={addStop} className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors tracking-tighter ring-1 ring-blue-500/30 px-3 py-1 rounded-full bg-blue-500/5 hover:bg-blue-500/10">+ Add Marker</button>
                                        </div>
                                        
                                        <div className="max-h-52 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                            {routeForm.stops?.map((stop, i) => (
                                                <div key={i} className="flex gap-3 items-center group animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                                    <div className="flex-1 relative">
                                                        <input className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-blue-500/40 outline-none transition-all" placeholder="Stop Label" value={stop.name} onChange={e => { const s = [...routeForm.stops]; s[i].name = e.target.value; setRouteForm({ ...routeForm, stops: s }); }} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input className="w-20 bg-slate-900/40 border border-slate-800 rounded-xl px-2 py-3 text-[10px] font-mono text-center text-slate-400 focus:border-blue-500/40 outline-none transition-all" placeholder="LAT" type="number" step="any" value={stop.latitude} onChange={e => { const s = [...routeForm.stops]; s[i].latitude = parseFloat(e.target.value); setRouteForm({ ...routeForm, stops: s }); }} />
                                                        <input className="w-20 bg-slate-900/40 border border-slate-800 rounded-xl px-2 py-3 text-[10px] font-mono text-center text-slate-400 focus:border-blue-500/40 outline-none transition-all" placeholder="LNG" type="number" step="any" value={stop.longitude} onChange={e => { const s = [...routeForm.stops]; s[i].longitude = parseFloat(e.target.value); setRouteForm({ ...routeForm, stops: s }); }} />
                                                    </div>
                                                    <button type="button" onClick={() => { const s = routeForm.stops.filter((_, idx) => idx !== i); setRouteForm({ ...routeForm, stops: s }); }} className="p-2.5 bg-red-500/5 hover:bg-red-500/20 text-red-500/40 hover:text-red-500 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            {(!routeForm.stops || routeForm.stops.length === 0) && (
                                                <div className="text-center py-6 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No Waypoints Defined</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer">Discard</button>
                                        <button type="submit" className="flex-1 px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                                            Finalize Alignment
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}

                {/* Ratings Modal */}
                {viewRatingsShuttle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-slate-800/90 backdrop-blur-2xl rounded-[32px] border border-slate-700/50 p-10 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95">
                            <button onClick={() => setViewRatingsShuttle(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                            <h2 className="text-2xl font-black text-white mb-6">Ratings for {viewRatingsShuttle.name}</h2>
                            {loadingRatings ? (
                                <p className="text-slate-400">Loading ratings...</p>
                            ) : shuttleRatings.length === 0 ? (
                                <p className="text-slate-400">No ratings yet for this shuttle.</p>
                            ) : (
                                <div className="space-y-4">
                                    {shuttleRatings.map(rating => (
                                        <div key={rating.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-yellow-500 font-bold">{'⭐'.repeat(rating.rating)}</span>
                                                <span className="text-xs text-slate-500">{new Date(rating.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {rating.comment && <p className="text-sm text-slate-300 italic">"{rating.comment}"</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
