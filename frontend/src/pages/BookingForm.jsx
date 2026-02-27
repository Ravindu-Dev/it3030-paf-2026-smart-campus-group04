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
            toast.success('Booking request submitted successfully!');
            navigate('/bookings');
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-4 cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-white">New Booking</h1>
                    <p className="text-slate-400 mt-1">Request to book a campus resource</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Facility Selector */}
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 space-y-5">
                        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Select Resource
                        </h2>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                Facility / Equipment *
                            </label>
                            {loadingFacilities ? (
                                <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    Loading facilities...
                                </div>
                            ) : (
                                <select
                                    value={facilityId}
                                    onChange={(e) => { setFacilityId(e.target.value); setErrors(prev => ({...prev, facilityId: undefined})); }}
                                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none transition-all ${
                                        errors.facilityId ? 'border-red-500/50' : 'border-slate-600/50'
                                    }`}
                                >
                                    <option value="">-- Select a facility --</option>
                                    {facilities.map(f => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} — {f.location} {f.capacity ? `(${f.capacity} seats)` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.facilityId && <p className="text-red-400 text-xs mt-1">{errors.facilityId}</p>}
                        </div>

                        {/* Selected Facility Preview */}
                        {selectedFacility && (
                            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{selectedFacility.name}</p>
                                    <p className="text-slate-400 text-xs">{selectedFacility.location} {selectedFacility.capacity ? ` · ${selectedFacility.capacity} seats` : ''}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date & Time */}
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 space-y-5">
                        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Date & Time
                        </h2>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Booking Date *</label>
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => { setBookingDate(e.target.value); setErrors(prev => ({...prev, bookingDate: undefined})); }}
                                min={today}
                                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                                    errors.bookingDate ? 'border-red-500/50' : 'border-slate-600/50'
                                }`}
                            />
                            {errors.bookingDate && <p className="text-red-400 text-xs mt-1">{errors.bookingDate}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">Start Time *</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => { setStartTime(e.target.value); setErrors(prev => ({...prev, startTime: undefined})); }}
                                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                                        errors.startTime ? 'border-red-500/50' : 'border-slate-600/50'
                                    }`}
                                />
                                {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime}</p>}
                            </div>
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">End Time *</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => { setEndTime(e.target.value); setErrors(prev => ({...prev, endTime: undefined})); }}
                                    className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                                        errors.endTime ? 'border-red-500/50' : 'border-slate-600/50'
                                    }`}
                                />
                                {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 space-y-5">
                        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Details
                        </h2>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Purpose *</label>
                            <textarea
                                value={purpose}
                                onChange={(e) => { setPurpose(e.target.value); setErrors(prev => ({...prev, purpose: undefined})); }}
                                rows={3}
                                placeholder="Describe why you need this resource..."
                                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all ${
                                    errors.purpose ? 'border-red-500/50' : 'border-slate-600/50'
                                }`}
                            />
                            {errors.purpose && <p className="text-red-400 text-xs mt-1">{errors.purpose}</p>}
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                Expected Attendees
                                <span className="text-slate-500 font-normal ml-1">(optional)</span>
                            </label>
                            <input
                                type="number"
                                value={expectedAttendees}
                                onChange={(e) => setExpectedAttendees(e.target.value)}
                                min="1"
                                placeholder="Number of attendees"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Booking Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
