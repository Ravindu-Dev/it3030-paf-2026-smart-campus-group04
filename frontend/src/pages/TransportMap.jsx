import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import transportService from '../services/transportService';

const center = { lat: 7.2906, lng: 80.6337 };

const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1d3d5c' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
    { featureType: 'poi.park', elementType: 'geometry.fill', stylers: [{ color: '#023e58' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
    { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

// Top-down Bus Icon — best for rotation and 'live' feel
function createBusIconUrl(color = '#3b82f6') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <!-- Pulsing Background -->
    <circle cx="24" cy="24" r="22" fill="${color}" fill-opacity="0.1">
      <animate attributeName="r" values="18;24;18" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.2;0.05;0.2" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <!-- Top-down Bus Body -->
    <rect x="18" y="10" width="12" height="28" rx="3" fill="${color}" stroke="white" stroke-width="2" />
    <!-- Windshield (Front) -->
    <rect x="19.5" y="12" width="9" height="4" rx="1" fill="white" fill-opacity="0.8" />
    <!-- Rear Window -->
    <rect x="20" y="35" width="8" height="1.5" rx="0.5" fill="white" fill-opacity="0.4" />
    <!-- Roof details -->
    <rect x="21" y="20" width="6" height="10" rx="1" fill="white" fill-opacity="0.2" />
  </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Reusable Map Component — used by both /transport and Dashboard overview
 */
export function ShuttleMap({ height = '600px', showControls = true, compact = false }) {
    const [shuttles, setShuttles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedShuttle, setSelectedShuttle] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const fetchData = useCallback(async () => {
        try {
            const [sRes, rRes] = await Promise.all([
                transportService.getAllShuttles(),
                transportService.getAllRoutes(),
            ]);
            if (sRes.success) setShuttles(sRes.data);
            if (rRes.success) setRoutes(rRes.data);
        } catch (e) {
            console.error('Failed to fetch transport data', e);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const activeShuttles = shuttles.filter(s => s.tracking && s.currentLatitude);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center bg-slate-800 rounded-2xl" style={{ height }}>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" style={{ height }}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={center}
                zoom={compact ? 14 : 15}
                options={{
                    styles: darkMapStyle,
                    disableDefaultUI: !showControls,
                    zoomControl: showControls,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: showControls,
                }}
            >
                {/* Route polylines */}
                {routes.map(route =>
                    route.stops && route.stops.length > 1 && (
                        <Polyline
                            key={route.id}
                            path={route.stops.map(s => ({ lat: s.latitude, lng: s.longitude }))}
                            options={{ strokeColor: route.color, strokeWeight: compact ? 3 : 4, strokeOpacity: 0.8 }}
                        />
                    )
                )}

                {/* Stop markers */}
                {routes.map(route =>
                    route.stops?.map((stop, i) => (
                        <Marker
                            key={`${route.id}-stop-${i}`}
                            position={{ lat: stop.latitude, lng: stop.longitude }}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                scale: compact ? 4 : 6,
                                fillColor: route.color,
                                fillOpacity: 1,
                                strokeColor: '#0f172a',
                                strokeWeight: 2,
                            }}
                            title={stop.name}
                        />
                    ))
                )}

                {/* Live bus markers */}
                {activeShuttles.map(shuttle => {
                    const shuttleRoute = routes.find(r => r.id === shuttle.routeId);
                    return (
                        <Marker
                            key={shuttle.id}
                            position={{ lat: shuttle.currentLatitude, lng: shuttle.currentLongitude }}
                            icon={{
                                url: createBusIconUrl(shuttleRoute?.color),
                                scaledSize: new window.google.maps.Size(compact ? 36 : 48, compact ? 36 : 48),
                                anchor: new window.google.maps.Point(compact ? 18 : 24, compact ? 18 : 24),
                                rotation: shuttle.heading || 0,
                            }}
                            onClick={() => setSelectedShuttle(shuttle)}
                        />
                    );
                })}

                {selectedShuttle && (
                    <InfoWindow
                        position={{ lat: selectedShuttle.currentLatitude, lng: selectedShuttle.currentLongitude }}
                        onCloseClick={() => setSelectedShuttle(null)}
                    >
                        <div className="p-1 min-w-[150px]" style={{ color: '#1e293b' }}>
                            <h3 className="font-bold text-base">{selectedShuttle.name}</h3>
                            <p className="text-xs text-gray-500">{selectedShuttle.plateNumber}</p>
                            <p className="text-xs mt-1">Driver: {selectedShuttle.driverName || 'N/A'}</p>
                            {selectedShuttle.speed != null && (
                                <p className="text-xs font-bold text-blue-600 mt-0.5">{Math.round(selectedShuttle.speed * 3.6)} km/h</p>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}

/**
 * Full Transport Map Page — /transport
 */
export default function TransportMap() {
    const [shuttles, setShuttles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [selectedShuttle, setSelectedShuttle] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const fetchData = useCallback(async () => {
        try {
            const [sRes, rRes] = await Promise.all([
                transportService.getAllShuttles(),
                transportService.getAllRoutes(),
            ]);
            if (sRes.success) setShuttles(sRes.data);
            if (rRes.success) setRoutes(rRes.data);
        } catch (e) {
            console.error('Failed to fetch transport data', e);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const filteredRoutes = selectedRoute ? routes.filter(r => r.id === selectedRoute) : routes;
    const activeShuttles = shuttles.filter(s => s.tracking && s.currentLatitude);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header / Hero */}
            <div className="pt-32 pb-20 text-center px-4 sm:px-6 lg:px-8 relative z-10 border-b border-slate-800/50 mb-8">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                    Shuttle <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Tracker</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto drop-shadow-md">
                    Real-time locations of SLIIT Kandy campus shuttles
                </p>
            </div>

            {/* Main content — map takes most space */}
            <div className="px-4 md:px-8 pb-8">
                <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row gap-4">
                    {/* Left sidebar — compact */}
                    <div className="lg:w-72 shrink-0 flex flex-col gap-3">
                        {/* Route filter */}
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filter Route</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedRoute || ''}
                                onChange={(e) => setSelectedRoute(e.target.value || null)}
                            >
                                <option value="">All Routes</option>
                                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>

                        {/* Routes list */}
                        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 space-y-2 max-h-[300px] overflow-y-auto">
                            {routes.map(route => (
                                <div
                                    key={route.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${selectedRoute === route.id || !selectedRoute
                                        ? 'bg-slate-700/50 border-blue-500/40'
                                        : 'bg-slate-900/30 border-slate-800 opacity-40'
                                        }`}
                                    onClick={() => setSelectedRoute(route.id === selectedRoute ? null : route.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: route.color }}></div>
                                        <span className="font-semibold truncate">{route.name}</span>
                                    </div>
                                    <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
                                        <span>{route.stops?.length || 0} stops</span>
                                        <span className="text-blue-400">{shuttles.filter(s => s.routeId === route.id && s.tracking).length} live</span>
                                    </div>
                                </div>
                            ))}
                            {routes.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No routes yet</p>}
                        </div>

                        {/* Live shuttles count */}
                        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-slate-300">{activeShuttles.length} Shuttles Live</span>
                            </div>
                            {activeShuttles.map(s => (
                                <div key={s.id} className="flex items-center justify-between py-1.5 border-t border-slate-700/50 text-xs">
                                    <span className="font-medium text-slate-200">{s.name}</span>
                                    <span className="text-slate-400 font-mono">{s.plateNumber}</span>
                                </div>
                            ))}
                            {activeShuttles.length === 0 && <p className="text-slate-500 text-xs">No shuttles online</p>}
                        </div>
                    </div>

                    {/* Map — takes remaining space */}
                    <div className="grow rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" style={{ minHeight: 'calc(100vh - 180px)' }}>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={center}
                            zoom={15}
                            options={{
                                styles: darkMapStyle,
                                disableDefaultUI: false,
                                zoomControl: true,
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: true,
                            }}
                        >
                            {filteredRoutes.map(route =>
                                route.stops && route.stops.length > 1 && (
                                    <Polyline
                                        key={route.id}
                                        path={route.stops.map(s => ({ lat: s.latitude, lng: s.longitude }))}
                                        options={{ strokeColor: route.color, strokeWeight: 4, strokeOpacity: 0.8 }}
                                    />
                                )
                            )}

                            {filteredRoutes.map(route =>
                                route.stops?.map((stop, i) => (
                                    <Marker
                                        key={`${route.id}-stop-${i}`}
                                        position={{ lat: stop.latitude, lng: stop.longitude }}
                                        icon={{
                                            path: window.google.maps.SymbolPath.CIRCLE,
                                            scale: 6,
                                            fillColor: route.color,
                                            fillOpacity: 1,
                                            strokeColor: '#0f172a',
                                            strokeWeight: 2,
                                        }}
                                        title={stop.name}
                                    />
                                ))
                            )}

                            {activeShuttles.map(shuttle => {
                                const shuttleRoute = routes.find(r => r.id === shuttle.routeId);
                                return (
                                    <Marker
                                        key={shuttle.id}
                                        position={{ lat: shuttle.currentLatitude, lng: shuttle.currentLongitude }}
                                        icon={{
                                            url: createBusIconUrl(shuttleRoute?.color),
                                            scaledSize: new window.google.maps.Size(48, 48),
                                            anchor: new window.google.maps.Point(24, 24),
                                            rotation: shuttle.heading || 0,
                                        }}
                                        onClick={() => setSelectedShuttle(shuttle)}
                                    />
                                );
                            })}

                            {selectedShuttle && (
                                <InfoWindow
                                    position={{ lat: selectedShuttle.currentLatitude, lng: selectedShuttle.currentLongitude }}
                                    onCloseClick={() => setSelectedShuttle(null)}
                                >
                                    <div className="p-2 min-w-[160px]" style={{ color: '#1e293b' }}>
                                        <h3 className="font-bold text-base">{selectedShuttle.name}</h3>
                                        <p className="text-xs text-gray-500">{selectedShuttle.plateNumber}</p>
                                        <p className="text-xs mt-1">Driver: {selectedShuttle.driverName || 'N/A'}</p>
                                        {selectedShuttle.speed != null && (
                                            <p className="text-xs font-bold text-blue-600 mt-1">{Math.round(selectedShuttle.speed * 3.6)} km/h</p>
                                        )}
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </div>
                </div>
            </div>
        </div>
    );
}
