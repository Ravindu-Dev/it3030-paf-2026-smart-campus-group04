import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllFacilities } from '../services/facilityService';
import { createBooking } from '../services/bookingService';
import toast from 'react-hot-toast';

/**
 * BookingForm — Create a new booking request.
 * If navigated with ?facilityId=xxx, pre-selects that facility.
 */
export default function BookingForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedFacilityId = searchParams.get('facilityId') || '';

    // Form state
    const [facilityId, setFacilityId] = useState(preselectedFacilityId);
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [expectedAttendees, setExpectedAttendees] = useState('');

    // Facilities list for selector
    const [facilities, setFacilities] = useState([]);
    const [loadingFacilities, setLoadingFacilities] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await getAllFacilities({ status: 'ACTIVE' });
                setFacilities(res.data.data || []);
            } catch (err) {
                toast.error('Failed to load facilities');
            } finally {
                setLoadingFacilities(false);
            }
        };
        fetchFacilities();
    }, []);

    const selectedFacility = facilities.find(f => f.id === facilityId);

    const validate = () => {
        const newErrors = {};
        if (!facilityId) newErrors.facilityId = 'Please select a facility';
        if (!bookingDate) newErrors.bookingDate = 'Date is required';
        if (!startTime) newErrors.startTime = 'Start time is required';
        if (!endTime) newErrors.endTime = 'End time is required';
        if (startTime && endTime && startTime >= endTime) {
            newErrors.endTime = 'End time must be after start time';
        }
        if (!purpose.trim()) newErrors.purpose = 'Purpose is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            const data = {
                facilityId,
                bookingDate,
                startTime: startTime + ':00', // append seconds for LocalTime
                endTime: endTime + ':00',
                purpose: purpose.trim(),
            };
            if (expectedAttendees) {
                data.expectedAttendees = parseInt(expectedAttendees);
            }

            await createBooking(data);
            toast.success('Your booking request has been submitted successfully!', { duration: 4000 });
            navigate('/profile', { state: { tab: 'bookings' } });
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create booking';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Get today's date in YYYY-MM-DD for the min attribute
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden pt-28 pb-10">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 -left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
                {/* Back Button */}
                <div className="mb-6 flex">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back
                    </button>
                </div>

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-3">
                        New <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Booking</span>
                    </h1>
                    <p className="text-slate-300 text-lg">Request to book a campus resource</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Facility Selector */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors pointer-events-none"></div>
                        <h2 className="text-white font-semibold text-xl flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            Select Resource
                        </h2>

                        <div className="relative z-10">
                            <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">
                                Facility / Equipment *
                            </label>
                            {loadingFacilities ? (
                                <div className="flex items-center gap-3 text-slate-400 text-sm py-4 px-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                    <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    Loading facilities...
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={facilityId}
                                        onChange={(e) => { setFacilityId(e.target.value); setErrors(prev => ({ ...prev, facilityId: undefined })); }}
                                        className={`w-full px-5 py-4 bg-slate-900/50 backdrop-blur-sm border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none transition-all shadow-inner ${errors.facilityId ? 'border-red-500/50' : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <option value="">-- Select a facility --</option>
                                        {facilities.map(f => (
                                            <option key={f.id} value={f.id} className="bg-slate-800">
                                                {f.name} — {f.location} {f.capacity ? `(${f.capacity} seats)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            )}
                            {errors.facilityId && <p className="text-red-400 text-sm mt-2 pl-1">{errors.facilityId}</p>}
                        </div>

                        {/* Selected Facility Preview */}
                        {selectedFacility && (
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600/10 to-transparent border border-blue-500/30 rounded-2xl relative z-10">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-base font-semibold">{selectedFacility.name}</p>
                                    <p className="text-slate-400 text-sm mt-0.5">{selectedFacility.location} {selectedFacility.capacity ? ` · ${selectedFacility.capacity} seats` : ''}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none"></div>
                        <h2 className="text-white font-semibold text-xl flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            Date & Time
                        </h2>

                        <div className="relative z-10">
                            <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Booking Date *</label>
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => { setBookingDate(e.target.value); setErrors(prev => ({ ...prev, bookingDate: undefined })); }}
                                min={today}
                                className={`w-full px-5 py-4 bg-slate-900/50 backdrop-blur-sm border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner [color-scheme:dark] ${errors.bookingDate ? 'border-red-500/50' : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            />
                            {errors.bookingDate && <p className="text-red-400 text-sm mt-2 pl-1">{errors.bookingDate}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Start Time *</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => { setStartTime(e.target.value); setErrors(prev => ({ ...prev, startTime: undefined })); }}
                                    className={`w-full px-5 py-4 bg-slate-900/50 backdrop-blur-sm border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner [color-scheme:dark] ${errors.startTime ? 'border-red-500/50' : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                />
                                {errors.startTime && <p className="text-red-400 text-sm mt-2 pl-1">{errors.startTime}</p>}
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">End Time *</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => { setEndTime(e.target.value); setErrors(prev => ({ ...prev, endTime: undefined })); }}
                                    className={`w-full px-5 py-4 bg-slate-900/50 backdrop-blur-sm border rounded-xl text-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner [color-scheme:dark] ${errors.endTime ? 'border-red-500/50' : 'border-slate-700 hover:border-slate-600'
                                        }`}
                                />
                                {errors.endTime && <p className="text-red-400 text-sm mt-2 pl-1">{errors.endTime}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors pointer-events-none"></div>
                        <h2 className="text-white font-semibold text-xl flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            Additional Details
                        </h2>

                        <div className="relative z-10">
                            <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">Purpose *</label>
                            <textarea
                                value={purpose}
                                onChange={(e) => { setPurpose(e.target.value); setErrors(prev => ({ ...prev, purpose: undefined })); }}
                                rows={4}
                                placeholder="Describe why you need this resource in detail..."
                                className={`w-full px-5 py-4 bg-slate-900/50 backdrop-blur-sm border rounded-xl text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all shadow-inner ${errors.purpose ? 'border-red-500/50' : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            />
                            {errors.purpose && <p className="text-red-400 text-sm mt-2 pl-1">{errors.purpose}</p>}
                        </div>

                        <div className="relative z-10">
                            <label className="block text-slate-300 text-sm font-medium mb-2 pl-1">
                                Expected Attendees
                                <span className="text-slate-500 font-normal ml-2 hover:text-slate-400 transition-colors cursor-help" title="Optional: Enter if this is a group activity">
                                    (optional)
                                </span>
                            </label>
                            <input
                                type="number"
                                value={expectedAttendees}
                                onChange={(e) => setExpectedAttendees(e.target.value)}
                                min="1"
                                placeholder="Estimated number of people"
                                className="w-full px-5 py-4 bg-slate-900/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 rounded-xl text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-white rounded-xl font-medium transition-all hover:shadow-lg cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting Request...
                                </span>
                            ) : (
                                'Submit Booking Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
}
