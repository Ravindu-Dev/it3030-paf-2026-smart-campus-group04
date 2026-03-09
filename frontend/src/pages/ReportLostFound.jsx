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

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
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
        if (!form.title.trim() || !form.description.trim() || !form.category) {
            toast.error('Please fill in all required fields.');
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

    return (
        <div className="min-h-screen bg-slate-900 pt-28 pb-16 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                        Report <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Item</span>
                    </h1>
                    <p className="text-slate-400">Help us keep the campus connected. Report a lost or found item.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 md:p-8 space-y-6">
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
                                        ? 'border-amber-500 bg-amber-500/10'
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
                        <input type="text" name="title" value={form.title} onChange={handleChange} required
                            placeholder="e.g. Black iPhone 15 Pro, Blue Backpack..."
                            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Description *</label>
                        <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                            placeholder="Describe the item in detail — color, brand, distinguishing features..."
                            className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none" />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Category *</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, category: cat.value }))}
                                    className={`p-3 rounded-xl border text-center text-sm font-medium transition-all cursor-pointer ${form.category === cat.value
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                        : 'border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="text-lg mb-1">{cat.icon}</div>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Location</label>
                            <input type="text" name="location" value={form.location} onChange={handleChange}
                                placeholder="e.g. Library, Building A..."
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Date</label>
                            <input type="date" name="dateOccurred" value={form.dateOccurred} onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
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
                            <label className="flex flex-col items-center justify-center w-full h-36 bg-slate-900/60 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-amber-500/40 hover:bg-slate-900/80 transition-all">
                                <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-slate-500">Click to upload a photo</span>
                                <span className="text-xs text-slate-600 mt-1">JPG, PNG, GIF up to 10MB</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Email</label>
                            <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Contact Phone</label>
                            <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange}
                                placeholder="+94 77 xxx xxxx"
                                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40" />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                    >
                        {submitting ? (uploading ? 'Uploading Image...' : 'Submitting...') : 'Report Item'}
                    </button>
                </form>
            </div>
        </div>
    );
}
