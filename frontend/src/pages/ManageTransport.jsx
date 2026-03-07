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

    const [shuttleForm, setShuttleForm] = useState({ name: '', plateNumber: '', driverName: '', driverPhone: '', routeId: '', imageUrl: '' });
    const [routeForm, setRouteForm] = useState({ name: '', description: '', color: '#3b82f6', stops: [], schedule: [] });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, rRes] = await Promise.all([transportService.getAllShuttles(), transportService.getAllRoutes()]);
            if (sRes.success) setShuttles(sRes.data);
            if (rRes.success) setRoutes(rRes.data);
        } catch (e) { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleShuttleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingShuttle) {
                await transportService.updateShuttle(editingShuttle.id, shuttleForm);
                toast.success('Shuttle updated');
            } else {
                await transportService.createShuttle(shuttleForm);
                toast.success('Shuttle created');
            }
            setShowModal(false); fetchData();
        } catch (e) { toast.error('Failed'); }
    };

    const handleRouteSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRoute) {
                await transportService.updateRoute(editingRoute.id, routeForm);
                toast.success('Route updated');
            } else {
                await transportService.createRoute(routeForm);
                toast.success('Route created');
            }
            setShowModal(false); fetchData();
        } catch (e) { toast.error('Failed'); }
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
        const link = `${window.location.origin}/track/${token}`;
        navigator.clipboard.writeText(link);
        toast.success('Tracking link copied! Send to driver.');
    };

    const openNewShuttle = () => {
        setEditingShuttle(null);
        setShuttleForm({ name: '', plateNumber: '', driverName: '', driverPhone: '', routeId: '', imageUrl: '' });
        setShowModal(true);
    };

    const openNewRoute = () => {
        setEditingRoute(null);
        setRouteForm({ name: '', description: '', color: '#3b82f6', stops: [], schedule: [] });
        setShowModal(true);
    };

    const addStop = () => {
        setRouteForm({ ...routeForm, stops: [...routeForm.stops, { name: '', latitude: 7.2906, longitude: 80.6337, orderIndex: routeForm.stops.length }] });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 pt-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white">🚌 Manage Transport</h1>
                        <p className="text-slate-400 mt-1">Shuttles, routes & tracking links</p>
                    </div>
                    <button
                        onClick={activeTab === 'shuttles' ? openNewShuttle : openNewRoute}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg font-semibold flex items-center gap-2 transition-all"
                    >
                        <span className="text-xl">+</span> Add {activeTab === 'shuttles' ? 'Shuttle' : 'Route'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-slate-800 rounded-xl w-fit mb-6">
                    {['shuttles', 'routes'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >{tab}</button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">Loading...</div>
                ) : activeTab === 'shuttles' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shuttles.map(shuttle => (
                            <div key={shuttle.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-xl text-2xl">🚌</div>
                                        <div>
                                            <h3 className="text-xl font-bold">{shuttle.name}</h3>
                                            <p className="text-slate-400 font-mono text-sm uppercase">{shuttle.plateNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditingShuttle(shuttle); setShuttleForm({ ...shuttle }); setShowModal(true); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">✏️</button>
                                        <button onClick={() => deleteShuttle(shuttle.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500">🗑️</button>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                    <span className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                        Route: <span className="text-blue-400">{routes.find(r => r.id === shuttle.routeId)?.name || 'None'}</span>
                                    </span>
                                    <span className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                        Driver: {shuttle.driverName || 'N/A'}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-lg border ${shuttle.tracking ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-900/50 border-slate-700/50 text-slate-500'}`}>
                                        {shuttle.tracking ? '● Live' : '○ Offline'}
                                    </span>
                                </div>

                                <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">Tracking Link</p>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">.../track/{shuttle.trackingToken}</p>
                                    </div>
                                    <button onClick={() => copyTrackingLink(shuttle.trackingToken)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all">
                                        Copy
                                    </button>
                                </div>
                            </div>
                        ))}
                        {shuttles.length === 0 && <p className="text-slate-500 col-span-2 text-center py-10">No shuttles yet. Create one!</p>}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {routes.map(route => (
                            <div key={route.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl" style={{ backgroundColor: route.color }}>🗺️</div>
                                    <div>
                                        <h3 className="text-xl font-bold">{route.name}</h3>
                                        <p className="text-slate-400 text-sm">{route.stops?.length || 0} Stops</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingRoute(route); setRouteForm({ ...route }); setShowModal(true); }} className="px-4 py-2 hover:bg-slate-700 rounded-lg text-slate-400">✏️ Edit</button>
                                    <button onClick={() => deleteRoute(route.id)} className="px-4 py-2 hover:bg-red-500/10 rounded-lg text-red-500">🗑️</button>
                                </div>
                            </div>
                        ))}
                        {routes.length === 0 && <p className="text-slate-500 text-center py-10">No routes yet. Create one!</p>}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6">{editingShuttle || editingRoute ? 'Edit' : 'Add'} {activeTab === 'shuttles' ? 'Shuttle' : 'Route'}</h2>

                            {activeTab === 'shuttles' ? (
                                <form onSubmit={handleShuttleSubmit} className="space-y-4">
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200" placeholder="Shuttle Name *" required value={shuttleForm.name} onChange={e => setShuttleForm({ ...shuttleForm, name: e.target.value })} />
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 uppercase text-slate-200" placeholder="Plate Number *" required value={shuttleForm.plateNumber} onChange={e => setShuttleForm({ ...shuttleForm, plateNumber: e.target.value.toUpperCase() })} />
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200" placeholder="Driver Name" value={shuttleForm.driverName} onChange={e => setShuttleForm({ ...shuttleForm, driverName: e.target.value })} />
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200" placeholder="Driver Phone" value={shuttleForm.driverPhone || ''} onChange={e => setShuttleForm({ ...shuttleForm, driverPhone: e.target.value })} />
                                    <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200" value={shuttleForm.routeId || ''} onChange={e => setShuttleForm({ ...shuttleForm, routeId: e.target.value })}>
                                        <option value="">Select Route</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-slate-700 rounded-xl font-bold">Cancel</button>
                                        <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 rounded-xl font-bold">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleRouteSubmit} className="space-y-4">
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200" placeholder="Route Name *" required value={routeForm.name} onChange={e => setRouteForm({ ...routeForm, name: e.target.value })} />
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200" placeholder="Description" value={routeForm.description || ''} onChange={e => setRouteForm({ ...routeForm, description: e.target.value })} />
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm text-slate-400">Color</label>
                                        <input type="color" value={routeForm.color} onChange={e => setRouteForm({ ...routeForm, color: e.target.value })} className="w-12 h-10 rounded-lg cursor-pointer" />
                                    </div>

                                    {/* Stops */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium text-slate-400">Stops</label>
                                            <button type="button" onClick={addStop} className="text-xs text-blue-400 hover:text-blue-300">+ Add Stop</button>
                                        </div>
                                        {routeForm.stops?.map((stop, i) => (
                                            <div key={i} className="flex gap-2 mb-2 items-center">
                                                <input className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200" placeholder="Stop Name" value={stop.name} onChange={e => { const s = [...routeForm.stops]; s[i].name = e.target.value; setRouteForm({ ...routeForm, stops: s }); }} />
                                                <input className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200" placeholder="Lat" type="number" step="any" value={stop.latitude} onChange={e => { const s = [...routeForm.stops]; s[i].latitude = parseFloat(e.target.value); setRouteForm({ ...routeForm, stops: s }); }} />
                                                <input className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200" placeholder="Lng" type="number" step="any" value={stop.longitude} onChange={e => { const s = [...routeForm.stops]; s[i].longitude = parseFloat(e.target.value); setRouteForm({ ...routeForm, stops: s }); }} />
                                                <button type="button" onClick={() => { const s = routeForm.stops.filter((_, idx) => idx !== i); setRouteForm({ ...routeForm, stops: s }); }} className="text-red-500 hover:text-red-400 text-sm">✕</button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-slate-700 rounded-xl font-bold">Cancel</button>
                                        <button type="submit" className="flex-1 px-6 py-3 bg-blue-600 rounded-xl font-bold">Save</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
