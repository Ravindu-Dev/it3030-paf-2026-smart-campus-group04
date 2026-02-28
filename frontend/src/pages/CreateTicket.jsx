import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createTicket } from '../services/ticketService';
import { getMyBookings } from '../services/bookingService';
import { uploadImage } from '../services/imageService';
import toast from 'react-hot-toast';

const CATEGORIES = [
    { value: 'ELECTRICAL', label: '⚡ Electrical', desc: 'Power outlets, wiring, lighting' },
    { value: 'PLUMBING', label: '🔧 Plumbing', desc: 'Water, pipes, drainage' },
    { value: 'HVAC', label: '❄️ HVAC', desc: 'Heating, ventilation, AC' },
    { value: 'IT_EQUIPMENT', label: '💻 IT Equipment', desc: 'Computers, projectors, networks' },
    { value: 'FURNITURE', label: '🪑 Furniture', desc: 'Desks, chairs, cabinets' },
    { value: 'STRUCTURAL', label: '🏗️ Structural', desc: 'Walls, floors, doors, windows' },
    { value: 'CLEANING', label: '🧹 Cleaning', desc: 'Spills, trash, sanitation' },
    { value: 'SAFETY', label: '🛡️ Safety', desc: 'Fire, security, hazards' },
    { value: 'OTHER', label: '📋 Other', desc: 'Miscellaneous issues' },
];

const PRIORITIES = [
    { value: 'LOW', label: 'Low', color: 'bg-slate-500', border: 'border-slate-400', desc: 'Can wait a few days' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-500', border: 'border-blue-400', desc: 'Should be addressed soon' },
    { value: 'HIGH', label: 'High', color: 'bg-amber-500', border: 'border-amber-400', desc: 'Needs urgent attention' },
    { value: 'CRITICAL', label: 'Critical', color: 'bg-red-500', border: 'border-red-400', desc: 'Immediate action required' },
];

export default function CreateTicket() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    // Form state
    const [form, setForm] = useState({
        bookingId: '',
        category: '',
        priority: 'MEDIUM',
        description: '',
        contactEmail: user?.email || '',
        contactPhone: '',
        imageUrls: [],
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await getMyBookings();
            setBookings(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoadingBookings(false);
        }
    };

    const selectedBooking = bookings.find(b => b.id === form.bookingId);

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (imageFiles.length + files.length > 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }
        const newFiles = [...imageFiles, ...files].slice(0, 3);
        setImageFiles(newFiles);
        const previews = newFiles.map(f => URL.createObjectURL(f));
        setImagePreviews(previews);
    };

    const removeImage = (index) => {
        const newFiles = imageFiles.filter((_, i) => i !== index);
        setImageFiles(newFiles);
        setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];
        setUploadingImages(true);
        try {
            const urls = await Promise.all(imageFiles.map(f => uploadImage(f)));
            return urls;
        } catch (err) {
            throw new Error('Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            let imageUrls = [];
            if (imageFiles.length > 0) {
                imageUrls = await uploadImages();
            }
            const payload = { ...form, imageUrls };
            await createTicket(payload);
            toast.success('Ticket created successfully!');
            navigate('/tickets');
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return form.bookingId;
            case 2: return form.category && form.priority;
            case 3: return form.description.trim().length >= 10;
            case 4: return true; // images optional
            case 5: return true; // review
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate('/tickets')} className="text-slate-400 hover:text-white transition-colors mb-4 flex items-center gap-2 text-sm cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back to Tickets
                    </button>
                    <h1 className="text-3xl font-bold text-white">
                        Report an <span className="text-amber-400">Issue</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Create a maintenance or incident ticket for a campus resource</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                    {['Select Booking', 'Category & Priority', 'Description', 'Evidence', 'Review'].map((label, i) => (
                        <div key={i} className="flex items-center gap-2 flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i + 1 ? 'bg-emerald-500 text-white' :
                                    step === i + 1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
                                        'bg-slate-700 text-slate-400'
                                }`}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span className={`text-sm whitespace-nowrap ${step === i + 1 ? 'text-white font-medium' : 'text-slate-500'}`}>
                                {label}
                            </span>
                            {i < 4 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">

                    {/* Step 1: Select Booking */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-semibold text-white mb-2">Select a Booking</h2>
                            <p className="text-slate-400 text-sm mb-6">Choose the resource booking you want to report an issue for</p>

                            {loadingBookings ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-700/50 rounded-xl animate-pulse" />)}
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-4xl mb-3 block">📋</span>
                                    <p className="text-slate-400">No bookings found. Create a booking first.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {bookings.map((booking) => (
                                        <button
                                            key={booking.id}
                                            onClick={() => setForm({ ...form, bookingId: booking.id })}
                                            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${form.bookingId === booking.id
                                                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                                                    : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{booking.facilityName}</p>
                                                    <p className="text-slate-400 text-sm mt-0.5">
                                                        {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                                                    </p>
                                                    <p className="text-slate-500 text-xs mt-1">{booking.purpose}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${booking.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            booking.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                                                                'bg-slate-600/50 text-slate-400'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    {form.bookingId === booking.id && (
                                                        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs">✓</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Category & Priority */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-semibold text-white mb-6">Issue Category & Priority</h2>

                            <div className="mb-8">
                                <label className="text-sm font-medium text-slate-300 mb-3 block">Category</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setForm({ ...form, category: cat.value })}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${form.category === cat.value
                                                    ? 'bg-amber-500/10 border-amber-500/50'
                                                    : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <span className="text-lg">{cat.label.split(' ')[0]}</span>
                                            <p className="text-white text-sm font-medium mt-1">{cat.label.split(' ').slice(1).join(' ')}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{cat.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-3 block">Priority Level</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {PRIORITIES.map((p) => (
                                        <button
                                            key={p.value}
                                            onClick={() => setForm({ ...form, priority: p.value })}
                                            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${form.priority === p.value
                                                    ? `border-2 ${p.border} shadow-lg`
                                                    : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <div className={`w-3 h-3 ${p.color} rounded-full mx-auto mb-2`} />
                                            <p className="text-white font-medium text-sm">{p.label}</p>
                                            <p className="text-slate-400 text-xs mt-1">{p.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Description */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-semibold text-white mb-2">Describe the Issue</h2>
                            <p className="text-slate-400 text-sm mb-6">Provide as much detail as possible about the problem</p>

                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the issue in detail... What happened? When did you notice it? Is it affecting usage?"
                                className="w-full h-40 bg-slate-700/50 border border-slate-600/50 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"
                            />
                            <p className="text-slate-500 text-xs mt-2">{form.description.length} characters (minimum 10)</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 block">Contact Email</label>
                                    <input
                                        type="email"
                                        value={form.contactEmail}
                                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                                        placeholder="your@email.com"
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 block">Contact Phone (optional)</label>
                                    <input
                                        type="tel"
                                        value={form.contactPhone}
                                        onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                                        placeholder="+94 7X XXX XXXX"
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Evidence Images */}
                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-semibold text-white mb-2">Upload Evidence</h2>
                            <p className="text-slate-400 text-sm mb-6">Add up to 3 photos of the issue (optional but recommended)</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {imagePreviews.map((preview, i) => (
                                    <div key={i} className="relative group">
                                        <img src={preview} alt={`Evidence ${i + 1}`} className="w-full h-40 object-cover rounded-xl border border-slate-600/50" />
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {imageFiles.length < 3 && (
                                    <label className="h-40 border-2 border-dashed border-slate-600/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all">
                                        <span className="text-3xl mb-2">📷</span>
                                        <span className="text-slate-400 text-sm">Click to upload</span>
                                        <span className="text-slate-500 text-xs mt-1">{3 - imageFiles.length} remaining</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {step === 5 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-semibold text-white mb-6">Review & Submit</h2>

                            <div className="space-y-4">
                                {/* Booking */}
                                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Resource / Booking</p>
                                    <p className="text-white font-medium">{selectedBooking?.facilityName}</p>
                                    <p className="text-slate-400 text-sm">{selectedBooking?.bookingDate} • {selectedBooking?.startTime} - {selectedBooking?.endTime}</p>
                                </div>

                                {/* Category & Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Category</p>
                                        <p className="text-white font-medium">{CATEGORIES.find(c => c.value === form.category)?.label}</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Priority</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 ${PRIORITIES.find(p => p.value === form.priority)?.color} rounded-full`} />
                                            <p className="text-white font-medium">{form.priority}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Description</p>
                                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{form.description}</p>
                                </div>

                                {/* Contact */}
                                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-2">Contact</p>
                                    <p className="text-white text-sm">{form.contactEmail}</p>
                                    {form.contactPhone && <p className="text-slate-400 text-sm">{form.contactPhone}</p>}
                                </div>

                                {/* Images */}
                                {imagePreviews.length > 0 && (
                                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                                        <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-3">Evidence ({imagePreviews.length} images)</p>
                                        <div className="flex gap-3">
                                            {imagePreviews.map((p, i) => (
                                                <img key={i} src={p} alt={`Evidence ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-slate-600/50" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
                        <button
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            className="px-6 py-2.5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                            ← Back
                        </button>

                        {step < 5 ? (
                            <button
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canProceed()}
                                className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 cursor-pointer"
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || uploadingImages}
                                className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 cursor-pointer flex items-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {uploadingImages ? 'Uploading images...' : 'Submitting...'}
                                    </>
                                ) : (
                                    'Submit Ticket 🎫'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
