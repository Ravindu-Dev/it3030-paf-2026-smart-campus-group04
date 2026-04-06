import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportLostFoundItem } from '../services/lostFoundService';
import { uploadImage } from '../services/imageService';
import toast from 'react-hot-toast';

const CATEGORIES = [
    { value: 'ELECTRONICS', label: 'Electronics', icon: '💻' },
    { value: 'CLOTHING', label: 'Clothing', icon: '👕' },
    { value: 'DOCUMENTS', label: 'Documents', icon: '📄' },
    { value: 'ACCESSORIES', label: 'Accessories', icon: '⌚' },
    { value: 'KEYS', label: 'Keys', icon: '🔑' },
    { value: 'BAGS', label: 'Bags', icon: '🎒' },
    { value: 'OTHER', label: 'Other', icon: '📦' },
];

export default function ReportLostFound() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [form, setForm] = useState({
        type: 'LOST',
        title: '',
        description: '',
        category: '',
        location: '',
        dateOccurred: '',
        imageUrl: '',
        contactEmail: '',
        contactPhone: '',
    });

    // ── Validation rules ─────────────────────────────────────────
    const validate = (fieldName, value, allValues = form) => {
        switch (fieldName) {
            case 'title':
                if (!value.trim()) return 'Item title is required.';
                if (value.trim().length < 3) return 'Title must be at least 3 characters.';
                if (value.trim().length > 100) return 'Title must be under 100 characters.';
                return '';
            case 'description':
                if (!value.trim()) return 'Description is required.';
                if (value.trim().length < 10) return 'Description must be at least 10 characters.';
                if (value.trim().length > 1000) return 'Description must be under 1000 characters.';
                return '';
            case 'category':
                if (!value) return 'Please select a category.';
                return '';
            case 'location':
                if (value && value.trim().length < 2) return 'Location must be at least 2 characters.';
                if (value && value.trim().length > 100) return 'Location must be under 100 characters.';
                return '';
            case 'dateOccurred':
                if (value) {
                    const selected = new Date(value);
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    if (selected > today) return 'Date cannot be in the future.';
                }
                return '';
            case 'contactEmail':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
                return '';
            case 'contactPhone':
                if (value && !/^[+]?[\d\s()-]{7,15}$/.test(value)) return 'Please enter a valid phone number.';
                return '';
            default:
                return '';
        }
    };

    const validateAll = () => {
        const newErrors = {};
        Object.keys(form).forEach(key => {
            if (key === 'type' || key === 'imageUrl') return; // skip non-validated fields
            const err = validate(key, form[key], form);
            if (err) newErrors[key] = err;
        });
        return newErrors;
    };

    // ── Handlers ─────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Real-time validation for touched fields
        if (touched[name]) {
            setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    };

    const handleCategorySelect = (value) => {
        setForm(prev => ({ ...prev, category: value }));
        setTouched(prev => ({ ...prev, category: true }));
        setErrors(prev => ({ ...prev, category: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Image must be under 10MB.');
                return;
            }
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error('Only JPG, PNG, GIF, and WebP images are allowed.');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setForm(prev => ({ ...prev, imageUrl: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all as touched
        const allTouched = {};
        Object.keys(form).forEach(k => { allTouched[k] = true; });
        setTouched(allTouched);

        // Validate all fields
        const newErrors = validateAll();
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors before submitting.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = { ...form };

            // Upload image to ImgBB if a file was selected
            if (imageFile) {
                setUploading(true);
                try {
                    const url = await uploadImage(imageFile);
                    payload.imageUrl = url;
                } catch (uploadErr) {
                    console.error('Image upload failed:', uploadErr);
                    toast.error('Image upload failed. Submitting without image.');
                } finally {
                    setUploading(false);
                }
            }

            if (!payload.dateOccurred) delete payload.dateOccurred;
            if (!payload.imageUrl) delete payload.imageUrl;
            if (!payload.contactEmail) delete payload.contactEmail;
            if (!payload.contactPhone) delete payload.contactPhone;
            if (!payload.location) delete payload.location;

            await reportLostFoundItem(payload);
            toast.success('Item reported successfully!');
            navigate('/lost-found');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to report item.');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper for field error styling
    const fieldBorder = (name) =>
        errors[name] && touched[name]
            ? 'border-red-500/60 focus:ring-red-500/40'
            : 'border-slate-700/60 focus:ring-blue-500/40';

    return (
        <div className="min-h-screen bg-slate-900 pt-28 pb-16 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <div className="mb-6 flex">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                        Back
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                        Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Item</span>
                    </h1>
                    <p className="text-slate-400">Help us keep the campus connected. Report a lost or found item.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-6" noValidate>
                    {/* Type Toggle */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">I want to report a:</label>
                        <div className="flex gap-3">
                            {[{ val: 'LOST', label: '🔍 Lost Item', desc: 'I lost something' }, { val: 'FOUND', label: '📦 Found Item', desc: 'I found something' }].map(opt => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, type: opt.val }))}
                                    className={`flex-1 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${form.type === opt.val
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="text-lg font-bold text-white">{opt.label}</div>
                                    <div className="text-xs text-slate-400 mt-1">{opt.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Item Title *</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} onBlur={handleBlur}
                            placeholder="e.g. Black iPhone 15 Pro, Blue Backpack..."
                            className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 ${fieldBorder('title')}`} />
                        {errors.title && touched.title && (
                            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-300">Description *</label>
                            <span className={`text-xs ${form.description.length > 1000 ? 'text-red-400' : 'text-slate-500'}`}>
                                {form.description.length}/1000
                            </span>
                        </div>
                        <textarea name="description" value={form.description} onChange={handleChange} onBlur={handleBlur} rows={4}
                            placeholder="Describe the item in detail — color, brand, distinguishing features..."
                            className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 resize-none ${fieldBorder('description')}`} />
                        {errors.description && touched.description && (
                            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
                        <div className={`grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-xl ${errors.category && touched.category ? 'ring-2 ring-red-500/40 p-1' : ''}`}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat.value)}
                                    className={`p-3 rounded-xl border text-center text-sm font-medium transition-all cursor-pointer ${form.category === cat.value
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                        : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="text-lg mb-1">{cat.icon}</div>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        {errors.category && touched.category && (
                            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                {errors.category}
                            </p>
                        )}
                    </div>

                    {/* Location & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Location</label>
                            <input type="text" name="location" value={form.location} onChange={handleChange} onBlur={handleBlur}
                                placeholder="e.g. Library, Building A..."
                                className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 ${fieldBorder('location')}`} />
                            {errors.location && touched.location && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                    {errors.location}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
                            <input type="date" name="dateOccurred" value={form.dateOccurred} onChange={handleChange} onBlur={handleBlur}
                                max={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 ${fieldBorder('dateOccurred')}`} />
                            {errors.dateOccurred && touched.dateOccurred && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                    {errors.dateOccurred}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Photo (optional)</label>
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-slate-700/60" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-36 bg-slate-900/60 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-blue-500/40 hover:bg-slate-900/80 transition-all">
                                <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-slate-500">Click to upload a photo</span>
                                <span className="text-xs text-slate-600 mt-1">JPG, PNG, GIF, WebP up to 10MB</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Email</label>
                            <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} onBlur={handleBlur}
                                placeholder="your@email.com"
                                className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 ${fieldBorder('contactEmail')}`} />
                            {errors.contactEmail && touched.contactEmail && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                    {errors.contactEmail}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Phone</label>
                            <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} onBlur={handleBlur}
                                placeholder="+94 77 xxx xxxx"
                                className={`w-full px-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 ${fieldBorder('contactPhone')}`} />
                            {errors.contactPhone && touched.contactPhone && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                                    {errors.contactPhone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                    >
                        {submitting ? (uploading ? 'Uploading Image...' : 'Submitting...') : 'Report Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}
