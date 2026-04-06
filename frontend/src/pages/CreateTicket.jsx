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
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [stepAttempted, setStepAttempted] = useState({});

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

    // ── Validation ─────────────────────────────────────────────
    const validate = (field, value) => {
        switch (field) {
            case 'bookingId':
                if (!value) return 'Please select a booking.';
                return '';
            case 'category':
                if (!value) return 'Please select an issue category.';
                return '';
            case 'priority':
                if (!value) return 'Please select a priority level.';
                return '';
            case 'description':
                if (!value.trim()) return 'Description is required.';
                if (value.trim().length < 10) return 'Description must be at least 10 characters.';
                if (value.trim().length > 2000) return 'Description must be under 2000 characters.';
                return '';
            case 'contactEmail':
                if (!value.trim()) return 'Contact email is required.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
                return '';
            case 'contactPhone':
                if (value && !/^[+]?[\d\s()-]{7,15}$/.test(value)) return 'Please enter a valid phone number.';
                return '';
            default:
                return '';
        }
    };

    const validateStep = (s) => {
        const newErrors = {};
        switch (s) {
            case 1:
                { const e = validate('bookingId', form.bookingId); if (e) newErrors.bookingId = e; }
                break;
            case 2:
                { const e = validate('category', form.category); if (e) newErrors.category = e; }
                { const e = validate('priority', form.priority); if (e) newErrors.priority = e; }
                break;
            case 3:
                { const e = validate('description', form.description); if (e) newErrors.description = e; }
                { const e = validate('contactEmail', form.contactEmail); if (e) newErrors.contactEmail = e; }
                { const e = validate('contactPhone', form.contactPhone); if (e) newErrors.contactPhone = e; }
                break;
            default: break;
        }
        return newErrors;
    };

    const ErrorMessage = ({ field }) => {
        if (!errors[field] || (!touched[field] && !stepAttempted[step])) return null;
        return (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                {errors[field]}
            </p>
        );
    };

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
        // Validate each file
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`"${file.name}" exceeds the 10MB file size limit.`);
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error(`"${file.name}" is not a supported image format. Use JPG, PNG, GIF, or WebP.`);
                return;
            }
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
            navigate('/profile', { state: { tab: 'tickets' } });
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const canProceed = () => {
        const stepErrors = validateStep(step);
        return Object.keys(stepErrors).length === 0;
    };

    const handleNext = () => {
        setStepAttempted(prev => ({ ...prev, [step]: true }));
        const stepErrors = validateStep(step);
        setErrors(prev => ({ ...prev, ...stepErrors }));
        if (Object.keys(stepErrors).length > 0) {
            toast.error('Please fix the errors before continuing.');
            return;
        }
        setStep(s => s + 1);
    };

    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (touched[field] || stepAttempted[step]) {
            setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
        }
    };

    const handleFieldBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: validate(field, form[field]) }));
    };
    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden pt-28 pb-10">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                {/* Back Button */}
                <div className="mb-6 flex">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50 hover:border-amber-500/50 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back
                    </button>
                </div>

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4">
                        Report an <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Issue</span>
                    </h1>
                    <p className="text-slate-300 text-lg">Create a maintenance or incident ticket for a campus resource</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between gap-2 mb-10 overflow-x-auto pb-4 custom-scrollbar bg-slate-800/20 p-4 rounded-3xl backdrop-blur-sm border border-slate-700/30">
                    {['Select Booking', 'Category & Priority', 'Description', 'Evidence', 'Review'].map((label, i) => (
                        <div key={i} className="flex items-center gap-3 flex-shrink-0 flex-1 last:flex-none">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step > i + 1 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/50' :
                                step === i + 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/50 scale-110' :
                                    'bg-slate-800 border border-slate-700 text-slate-500'
                                }`}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs sm:text-sm font-bold tracking-wide uppercase whitespace-nowrap hidden sm:block ${step === i + 1 ? 'text-amber-400 glow-text' : step > i + 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {label}
                            </span>
                            {i < 4 && <div className={`h-1 flex-1 min-w-[20px] rounded-full transition-all duration-500 ${step > i + 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>

                    {/* Step 1: Select Booking */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400">📋</span>
                                Select a Booking
                            </h2>
                            <p className="text-slate-400 text-[15px] mb-4">Choose the resource booking you want to report an issue for</p>
                            <ErrorMessage field="bookingId" />

                            {loadingBookings ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-700/30 rounded-2xl animate-pulse border border-slate-600/30" />)}
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-700/50">
                                    <span className="text-5xl mb-4 block transform hover:scale-110 transition-transform">📋</span>
                                    <p className="text-slate-300 text-lg font-semibold">No bookings found</p>
                                    <p className="text-slate-500 text-sm mt-1">Create a booking first to report an issue for it.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                                    {bookings.map((booking) => (
                                        <button
                                            key={booking.id}
                                            onClick={() => setForm({ ...form, bookingId: booking.id })}
                                            className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${form.bookingId === booking.id
                                                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                                                : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-white font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors">{booking.facilityName}</p>
                                                    <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm font-medium">
                                                        <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>{booking.bookingDate}</span>
                                                        <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>{booking.startTime} - {booking.endTime}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs mt-2 bg-slate-800/80 inline-block px-3 py-1 rounded-lg border border-slate-700/50">{booking.purpose}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${booking.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                                        booking.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                                            'bg-slate-800 text-slate-400 border-slate-600'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${form.bookingId === booking.id ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/40 scale-110' : 'bg-slate-800 border-2 border-slate-600'}`}>
                                                        {form.bookingId === booking.id && <span className="text-white text-sm font-bold">✓</span>}
                                                    </div>
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
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400">🏷️</span>
                                Issue Category & Priority
                            </h2>

                            <div className="mb-10">
                                <label className="text-sm font-bold text-slate-300 mb-4 block uppercase tracking-wider">Select Category</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setForm({ ...form, category: cat.value })}
                                            className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer group ${form.category === cat.value
                                                ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] transform -translate-y-1'
                                                : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">{cat.label.split(' ')[0]}</span>
                                                <span className="text-white font-bold text-[15px]">{cat.label.split(' ').slice(1).join(' ')}</span>
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed">{cat.desc}</p>
                                        </button>
                                    ))}
                                </div>
                                <ErrorMessage field="category" />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-300 mb-4 block uppercase tracking-wider">Select Priority Level</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    {PRIORITIES.map((p) => (
                                        <button
                                            key={p.value}
                                            onClick={() => setForm({ ...form, priority: p.value })}
                                            className={`p-5 rounded-2xl border text-center transition-all duration-300 cursor-pointer group relative overflow-hidden ${form.priority === p.value
                                                ? `bg-slate-800/80 border-${p.border.split('-')[1]}-500/50 ring-1 ring-${p.border.split('-')[1]}-500/30 shadow-[0_0_20px_rgba(0,0,0,0.3)] transform -translate-y-1`
                                                : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                                                }`}
                                        >
                                            {form.priority === p.value && (
                                                <div className={`absolute inset-0 ${p.color}/10 blur-xl`}></div>
                                            )}
                                            <div className="relative z-10">
                                                <div className={`w-4 h-4 ${p.color} ${form.priority === p.value ? 'animate-pulse' : ''} rounded-full mx-auto mb-3 shadow-lg`} />
                                                <p className="text-white font-bold text-[15px] mb-1">{p.label}</p>
                                                <p className="text-slate-400 text-xs font-medium">{p.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Description */}
                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">📝</span>
                                Describe the Issue
                            </h2>
                            <p className="text-slate-400 text-[15px] mb-8">Provide as much detail as possible about the problem</p>

                            <div className="relative group">
                                <div className={`absolute -inset-0.5 bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-2xl blur transition duration-500 ${errors.description && (touched.description || stepAttempted[3]) ? 'opacity-0' : 'opacity-0 group-focus-within:opacity-100'}`}></div>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                    onBlur={() => handleFieldBlur('description')}
                                    placeholder="Describe the issue in detail... What happened? When did you notice it? Is it affecting usage?"
                                    className={`relative w-full h-48 bg-slate-900/80 border rounded-2xl p-5 text-white placeholder-slate-500 focus:outline-none transition-all resize-none shadow-inner ${errors.description && (touched.description || stepAttempted[3]) ? 'border-red-500/60 focus:border-red-500/60' : 'border-slate-700 focus:border-amber-500/50'}`}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-2 px-2">
                                <div>
                                    <p className={`text-xs font-medium ${form.description.length >= 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {form.description.length >= 10 ? '✓ Minimum length met' : 'Requires at least 10 characters'}
                                    </p>
                                    <ErrorMessage field="description" />
                                </div>
                                <p className={`text-xs font-bold px-2 py-1 rounded-md ${form.description.length > 2000 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>{form.description.length}/2000</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
                                <div>
                                    <label className="text-sm font-bold text-slate-300 mb-3 block uppercase tracking-wider">Contact Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                        </div>
                                        <input
                                            type="email"
                                            value={form.contactEmail}
                                            onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                                            onBlur={() => handleFieldBlur('contactEmail')}
                                            placeholder="your@email.com"
                                            className={`w-full bg-slate-900/50 border rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all ${errors.contactEmail && (touched.contactEmail || stepAttempted[3]) ? 'border-red-500/60' : 'border-slate-700'}`}
                                        />
                                    </div>
                                    <ErrorMessage field="contactEmail" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-300 mb-3 block uppercase tracking-wider">Contact Phone <span className="text-slate-500 normal-case font-normal ml-1">(Optional)</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        </div>
                                        <input
                                            type="tel"
                                            value={form.contactPhone}
                                            onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                                            onBlur={() => handleFieldBlur('contactPhone')}
                                            placeholder="+94 77 xxx xxxx"
                                            className={`w-full bg-slate-900/50 border rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all ${errors.contactPhone && (touched.contactPhone || stepAttempted[3]) ? 'border-red-500/60' : 'border-slate-700'}`}
                                        />
                                    </div>
                                    <ErrorMessage field="contactPhone" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Evidence Images */}
                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">📸</span>
                                Upload Evidence
                            </h2>
                            <p className="text-slate-400 text-[15px] mb-8">Add up to 3 photos of the issue (optional but highly recommended)</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {imagePreviews.map((preview, i) => (
                                    <div key={i} className="relative group rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-amber-500/50 transition-all">
                                        <img src={preview} alt={`Evidence ${i + 1}`} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transform scale-75 group-hover:scale-100 transition-all shadow-lg"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {imageFiles.length < 3 && (
                                    <label className="h-48 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group bg-slate-900/30">
                                        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors shadow-inner">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                        </div>
                                        <span className="text-white font-bold mb-1">Upload Photo</span>
                                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{3 - imageFiles.length} remaining</span>
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
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="p-2 bg-amber-500/20 rounded-lg text-amber-400">🔍</span>
                                Review & Submit
                            </h2>

                            <div className="space-y-6">
                                {/* Booking */}
                                <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 shadow-inner">
                                    <p className="text-amber-400 text-xs uppercase tracking-widest font-bold mb-3">Resource / Booking</p>
                                    <p className="text-white text-lg font-bold mb-1">{selectedBooking?.facilityName}</p>
                                    <p className="text-slate-400 text-sm font-medium flex gap-3">
                                        <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>{selectedBooking?.bookingDate}</span>
                                        <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>{selectedBooking?.startTime} - {selectedBooking?.endTime}</span>
                                    </p>
                                </div>

                                {/* Category & Priority */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 shadow-inner">
                                        <p className="text-purple-400 text-xs uppercase tracking-widest font-bold mb-3">Category</p>
                                        <p className="text-white font-bold text-lg flex items-center gap-2">
                                            {CATEGORIES.find(c => c.value === form.category)?.label}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 shadow-inner">
                                        <p className="text-rose-400 text-xs uppercase tracking-widest font-bold mb-3">Priority</p>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3.5 h-3.5 ${PRIORITIES.find(p => p.value === form.priority)?.color} rounded-full shadow-lg`} />
                                            <p className="text-white font-bold text-lg">{form.priority}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 shadow-inner">
                                    <p className="text-emerald-400 text-xs uppercase tracking-widest font-bold mb-3">Description</p>
                                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                                        <p className="text-slate-300 text-[15px] whitespace-pre-wrap leading-relaxed">{form.description}</p>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 shadow-inner">
                                    <p className="text-cyan-400 text-xs uppercase tracking-widest font-bold mb-3">Contact Details</p>
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
                                        <div>
                                            <p className="text-slate-500 text-xs font-semibold uppercase mb-1">Email</p>
                                            <p className="text-white font-medium flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>{form.contactEmail}</p>
                                        </div>
                                        {form.contactPhone && (
                                            <div>
                                                <p className="text-slate-500 text-xs font-semibold uppercase mb-1">Phone</p>
                                                <p className="text-white font-medium flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>{form.contactPhone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Images */}
                                {imagePreviews.length > 0 && (
                                    <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50 shadow-inner">
                                        <p className="text-indigo-400 text-xs uppercase tracking-widest font-bold mb-4">Evidence ({imagePreviews.length} images)</p>
                                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                            {imagePreviews.map((p, i) => (
                                                <img key={i} src={p} alt={`Evidence ${i + 1}`} className="w-32 h-32 object-cover rounded-xl border-2 border-slate-700 shadow-md flex-shrink-0" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-12 pt-8 border-t border-slate-700/50 relative z-10">
                        <button
                            onClick={() => setStep(s => Math.max(1, s - 1))}
                            disabled={step === 1}
                            className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center"
                        >
                            ← Back
                        </button>

                        {step < 5 ? (
                            <button
                                onClick={handleNext}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 cursor-pointer flex justify-center items-center"
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || uploadingImages}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                                {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{uploadingImages ? 'Uploading Request...' : 'Submitting...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Ticket</span>
                                        <span className="text-xl">🚀</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
