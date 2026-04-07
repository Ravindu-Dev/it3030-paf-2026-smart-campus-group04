import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { markAttendance } from '../services/attendanceService';
import toast from 'react-hot-toast';

/**
 * ScanAttendance — QR code scanner page for marking attendance.
 *
 * Uses the device camera to scan student/staff QR codes and
 * submits attendance records to the backend.
 */
export default function ScanAttendance() {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(false);
    const [lastScanned, setLastScanned] = useState(null);
    const [status, setStatus] = useState('PRESENT');
    const [location, setLocation] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const startScanning = async () => {
        setError(null);
        setScanResult(null);

        try {
            const html5QrCode = new Html5Qrcode('qr-reader');
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                async (decodedText) => {
                    // Parse QR data
                    try {
                        const data = JSON.parse(decodedText);
                        const userId = data.id || data.userId;
                        const type = data.t || data.type;
                        const name = data.name || 'Student';
                        const email = data.email || '';

                        if ((type !== 'SMART_CAMPUS_ID' && type !== 'SCI') || !userId) {
                            setError('Invalid QR code. Not a Smart Campus ID.');
                            return;
                        }

                        // Prevent rapid re-scans of the same user
                        if (lastScanned?.userId === userId &&
                            Date.now() - lastScanned.time < 5000) {
                            return;
                        }

                        // Stop scanner before API call
                        await html5QrCode.stop();
                        setScanning(false);

                        // Mark attendance
                        try {
                            const res = await markAttendance({
                                userId: userId,
                                status: status,
                                location: location || null,
                            });
                            const record = res.data.data;
                            setScanResult({
                                success: true,
                                name: record.userName || name,
                                email: record.userEmail || email,
                                status: record.status,
                            });
                            setLastScanned({ userId: userId, time: Date.now() });
                            toast.success(`Attendance marked for ${record.userName || name}!`);
                        } catch (err) {
                            const msg = err.response?.data?.message || 'Failed to mark attendance.';
                            setScanResult({
                                success: false,
                                name: data.name,
                                email: data.email,
                                error: msg,
                            });
                            toast.error(msg);
                        }
                    } catch {
                        setError('Could not parse QR code data.');
                    }
                },
                () => { /* ignore errors during scanning */ }
            );
            setScanning(true);
        } catch (err) {
            setError('Could not access camera. Please grant camera permission and try again.');
            console.error('Scanner error:', err);
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch { /* ignore */ }
        }
        setScanning(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                try {
                    html5QrCodeRef.current.stop();
                } catch { /* ignore */ }
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="mb-8 pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                        Scan <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">Attendance</span>
                    </h1>
                    <p className="text-slate-400">Scan a student or staff QR code to mark attendance</p>
                </div>

                {/* Settings */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 mb-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        ⚙️ Scan Settings
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 cursor-pointer"
                            >
                                <option value="PRESENT">✅ Present</option>
                                <option value="LATE">⏰ Late</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                Location (Optional)
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Main Hall, Lab 3"
                                className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                            />
                        </div>
                    </div>
                </div>

                {/* Scanner */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            📷 QR Scanner
                        </h3>
                        {scanning && (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Scanning...
                            </span>
                        )}
                    </div>

                    {/* Scanner viewport */}
                    <div
                        id="qr-reader"
                        ref={scannerRef}
                        className="w-full rounded-xl overflow-hidden bg-slate-900/80 border border-slate-700/50"
                        style={{ minHeight: scanning ? '300px' : '0px' }}
                    />

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-xl">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Scan Result */}
                    {scanResult && (
                        <div className={`mt-4 p-4 rounded-xl border ${
                            scanResult.success
                                ? 'bg-emerald-900/20 border-emerald-800/50'
                                : 'bg-red-900/20 border-red-800/50'
                        }`}>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{scanResult.success ? '✅' : '❌'}</span>
                                <div>
                                    <p className={`font-semibold ${scanResult.success ? 'text-emerald-300' : 'text-red-300'}`}>
                                        {scanResult.success ? 'Attendance Marked!' : 'Failed'}
                                    </p>
                                    <p className="text-white text-sm mt-1">{scanResult.name}</p>
                                    <p className="text-slate-400 text-xs">{scanResult.email}</p>
                                    {scanResult.success && (
                                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            scanResult.status === 'PRESENT'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                        }`}>
                                            {scanResult.status}
                                        </span>
                                    )}
                                    {scanResult.error && (
                                        <p className="text-red-400 text-xs mt-1">{scanResult.error}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-6">
                        {!scanning ? (
                            <button
                                onClick={startScanning}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {scanResult ? 'Scan Another' : 'Start Scanning'}
                            </button>
                        ) : (
                            <button
                                onClick={stopScanning}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-all cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                </svg>
                                Stop Scanning
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
