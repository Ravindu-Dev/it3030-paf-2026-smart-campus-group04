import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import transportService from '../services/transportService';
import toast from 'react-hot-toast';

export default function DriverTracking() {
    const { token } = useParams();
    const [shuttle, setShuttle] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [coords, setCoords] = useState(null);
    const [gpsStatus, setGpsStatus] = useState('idle'); // idle | acquiring | active | error | simulated
    const watchId = useRef(null);
    const simInterval = useRef(null);

    const fetchShuttle = useCallback(async () => {
        try {
            const res = await transportService.getShuttleByToken(token);
            if (res.success) {
                setShuttle(res.data);
                setIsTracking(res.data.tracking);
            }
        } catch (e) {
            toast.error('Invalid tracking link');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchShuttle(); }, [fetchShuttle]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
            if (simInterval.current) clearInterval(simInterval.current);
        };
    }, []);

    const sendLocation = async (latitude, longitude, heading, speed) => {
        try {
            await transportService.updateLocation(token, { latitude, longitude, heading, speed });
            setLastUpdate(new Date());
            setCoords({ latitude, longitude });
        } catch (e) {
            console.error('Location update failed');
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported by this browser');
            return;
        }
        setIsTracking(true);
        setGpsStatus('acquiring');
        toast('Acquiring GPS signal...', { icon: '📡' });

        watchId.current = navigator.geolocation.watchPosition(
            async (pos) => {
                setGpsStatus('active');
                const { latitude, longitude, heading, speed } = pos.coords;
                await sendLocation(latitude, longitude, heading, speed);
            },
            (err) => {
                console.error('GPS error:', err);
                if (err.code === 1) {
                    toast.error('Location access denied. Please allow location in browser settings.');
                    setIsTracking(false);
                    setGpsStatus('error');
                } else if (err.code === 2) {
                    toast.error('Location unavailable. Trying again...');
                    setGpsStatus('acquiring');
                } else if (err.code === 3) {
                    // Timeout — don't stop tracking, just keep trying
                    setGpsStatus('acquiring');
                }
            },
            {
                enableHighAccuracy: false,  // Use WiFi/IP first (faster), fall back to GPS
                maximumAge: 30000,          // Accept cached position up to 30 seconds old
                timeout: 60000,             // Wait up to 60 seconds
            }
        );
    };

    const stopTracking = async () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        if (simInterval.current) {
            clearInterval(simInterval.current);
            simInterval.current = null;
        }
        setIsTracking(false);
        setGpsStatus('idle');
        setCoords(null);
        try {
            await transportService.stopTracking(token);
            toast.success('Tracking Stopped');
        } catch (e) { }
    };

    // Simulate GPS for desktop testing — moves around SLIIT Kandy campus
    const startSimulation = async () => {
        setIsTracking(true);
        setGpsStatus('simulated');
        toast.success('Simulated GPS Started (SLIIT Kandy area)');

        let angle = 0;
        const baseLat = 7.2906;
        const baseLng = 80.6337;
        const radius = 0.003; // ~300m radius

        // Send initial position
        await sendLocation(baseLat, baseLng, 0, 8.3);

        simInterval.current = setInterval(async () => {
            angle += 15; // Move 15 degrees each tick
            if (angle >= 360) angle = 0;
            const lat = baseLat + radius * Math.sin((angle * Math.PI) / 180);
            const lng = baseLng + radius * Math.cos((angle * Math.PI) / 180);
            const heading = angle;
            const speed = 5 + Math.random() * 10; // 5-15 m/s
            await sendLocation(lat, lng, heading, speed);
        }, 3000); // Update every 3 seconds
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500">Loading...</div>;

    if (!shuttle) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500 text-center p-10">
            <div>
                <h1 className="text-3xl font-bold mb-4 text-white">Invalid Link</h1>
                <p>This tracking link is not active.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 text-4xl transition-all duration-1000 ${isTracking ? 'bg-green-500/10 ring-4 ring-green-500/20 animate-pulse' : 'bg-slate-700'}`}>
                    🚌
                </div>

                <h1 className="text-3xl font-extrabold mb-1">{shuttle.name}</h1>
                <p className="text-slate-400 font-mono text-sm uppercase mb-4">{shuttle.plateNumber}</p>

                <div className="bg-slate-900/50 px-4 py-2 rounded-xl mb-6 border border-slate-700/50 text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Route</p>
                    <p className="text-blue-400 font-semibold">{shuttle.route?.name || 'No Route Assigned'}</p>
                </div>

                {/* Main tracking button */}
                <button
                    onClick={isTracking ? stopTracking : startTracking}
                    className={`w-full py-5 rounded-2xl text-xl font-bold transition-all transform active:scale-95 shadow-xl cursor-pointer ${isTracking
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                        }`}
                >
                    {isTracking ? '⏹ STOP TRACKING' : '▶ START TRACKING'}
                </button>

                {/* Simulate button — for desktop testing */}
                {!isTracking && (
                    <button
                        onClick={startSimulation}
                        className="w-full mt-3 py-3 rounded-xl text-sm font-medium bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-all cursor-pointer"
                    >
                        🖥️ Simulate GPS (Desktop Testing)
                    </button>
                )}

                {/* Status display */}
                <div className="mt-6 flex flex-col gap-2 items-center w-full">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${gpsStatus === 'active' || gpsStatus === 'simulated' ? 'bg-green-500 animate-pulse'
                                : gpsStatus === 'acquiring' ? 'bg-yellow-500 animate-pulse'
                                    : gpsStatus === 'error' ? 'bg-red-500'
                                        : 'bg-slate-600'
                            }`}></div>
                        <span className="text-sm font-medium">
                            {gpsStatus === 'active' && 'Transmitting GPS Data...'}
                            {gpsStatus === 'simulated' && 'Simulated Mode Active'}
                            {gpsStatus === 'acquiring' && 'Acquiring GPS signal...'}
                            {gpsStatus === 'error' && 'GPS Error'}
                            {gpsStatus === 'idle' && 'Offline'}
                        </span>
                    </div>

                    {coords && (
                        <p className="text-[10px] text-slate-500 font-mono">
                            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                        </p>
                    )}

                    {lastUpdate && isTracking && (
                        <p className="text-[10px] text-slate-500 italic">Last ping: {lastUpdate.toLocaleTimeString()}</p>
                    )}
                </div>

                <p className="text-slate-500 text-[10px] mt-10 leading-relaxed max-w-[250px] text-center">
                    Keep this page open while driving. Your position is shared with SLIIT Kandy campus.
                </p>
            </div>
        </div>
    );
}
