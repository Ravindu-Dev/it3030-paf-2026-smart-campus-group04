import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllFacilities, createFacility, updateFacility, deleteFacility } from '../services/facilityService';
import { uploadImage } from '../services/imageService';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
    { value: 'LECTURE_HALL', label: 'Lecture Hall' },
    { value: 'LAB', label: 'Lab' },
    { value: 'MEETING_ROOM', label: 'Meeting Room' },
    { value: 'PROJECTOR', label: 'Projector' },
    { value: 'CAMERA', label: 'Camera' },
    { value: 'OTHER_EQUIPMENT', label: 'Other Equipment' },
];

const TYPE_LABELS = {
    LECTURE_HALL: 'Lecture Hall',
    LAB: 'Lab',
    MEETING_ROOM: 'Meeting Room',
    PROJECTOR: 'Projector',
    CAMERA: 'Camera',
    OTHER_EQUIPMENT: 'Other Equipment',
};

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const emptyForm = {
    name: '',
    type: 'LECTURE_HALL',
    description: '',
    capacity: '',
    location: '',
    imageUrl: '',
    availabilityWindows: [],
};

export default function ManageFacilities({ standalone = false }) {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // null = create, object = edit
    const [form, setForm] = useState({ ...emptyForm });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const res = await getAllFacilities();
            setFacilities(res.data.data || []);
        } catch {
            toast.error('Failed to load facilities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    // ─── Modal open/close ────────────────────────────────────────────

    const openCreateModal = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setImagePreview('');
        setShowModal(true);
    };

    const openEditModal = (facility) => {
        setEditing(facility);
        setForm({
            name: facility.name || '',
            type: facility.type || 'LECTURE_HALL',
            description: facility.description || '',
            capacity: facility.capacity || '',
            location: facility.location || '',
            imageUrl: facility.imageUrl || '',
            availabilityWindows: facility.availabilityWindows || [],
        });
        setImagePreview(facility.imageUrl || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ ...emptyForm });
        setImagePreview('');
    };

    // ─── Image upload ────────────────────────────────────────────────

    const handleImageUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be less than 10MB');
            return;
        }

        try {
            setUploading(true);
            const url = await uploadImage(file);
            setForm(prev => ({ ...prev, imageUrl: url }));
            setImagePreview(url);
            toast.success('Image uploaded!');
        } catch (err) {
            console.error('Upload failed:', err);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    };

    const removeImage = () => {
        setForm(prev => ({ ...prev, imageUrl: '' }));
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Form handlers ──────────────────────────────────────────────

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const addAvailabilityWindow = () => {
        setForm(prev => ({
            ...prev,
            availabilityWindows: [
                ...prev.availabilityWindows,
                { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '17:00' }
            ]
        }));
    };

    const updateAvailabilityWindow = (index, field, value) => {
        setForm(prev => {
            const updated = [...prev.availabilityWindows];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, availabilityWindows: updated };
        });
    };

    const removeAvailabilityWindow = (index) => {
        setForm(prev => ({
            ...prev,
            availabilityWindows: prev.availabilityWindows.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...form,
                capacity: form.capacity ? parseInt(form.capacity) : null,
            };

            if (editing) {
                await updateFacility(editing.id, payload);
                toast.success('Facility updated successfully');
            } else {
                await createFacility(payload);
                toast.success('Facility created successfully');
            }

            closeModal();
            fetchFacilities();
        } catch (err) {
            const msg = err.response?.data?.message || 'Operation failed';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Delete ──────────────────────────────────────────────────────

    const handleDelete = async (id) => {
        try {
            await deleteFacility(id);
            toast.success('Facility deleted');
            setDeleteConfirm(null);
            fetchFacilities();
        } catch {
            toast.error('Failed to delete facility');
        }
    };

    // ─── Toggle status ──────────────────────────────────────────────

    const toggleStatus = async (facility) => {
        try {
            const newStatus = facility.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
            await updateFacility(facility.id, { status: newStatus });
            toast.success(`Status changed to ${newStatus.replace('_', ' ').toLowerCase()}`);
            fetchFacilities();
        } catch {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className={standalone ? "" : "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${standalone ? "py-0" : "py-8"}`}>
                {/* Header */}
                {!standalone && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link to="/facilities" className="text-slate-400 hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m12 19-7-7 7-7" />
                                    <path d="M19 12H5" />
                                </svg>
                            </Link>
                            <h1 className="text-3xl font-bold text-white">Manage Facilities</h1>
                        </div>
                        <p className="text-slate-400 text-sm ml-8">Create, edit, and manage campus resources</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 text-sm cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                        Add Facility
                    </button>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : facilities.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🏗️</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No facilities yet</h3>
                        <p className="text-slate-400 mb-6">Get started by adding your first campus resource</p>
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
                        >
                            Add First Facility
                        </button>
                    </div>
                ) : (
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="px-5 py-4 text-left font-medium text-slate-400">Name</th>
                                        <th className="px-5 py-4 text-left font-medium text-slate-400">Type</th>
                                        <th className="px-5 py-4 text-left font-medium text-slate-400">Location</th>
                                        <th className="px-5 py-4 text-left font-medium text-slate-400">Capacity</th>
                                        <th className="px-5 py-4 text-left font-medium text-slate-400">Status</th>
                                        <th className="px-5 py-4 text-right font-medium text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facilities.map(f => (
                                        <tr key={f.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <Link to={`/facilities/${f.id}`} className="text-white font-medium hover:text-blue-400 transition-colors">
                                                    {f.name}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-300">
                                                {TYPE_LABELS[f.type] || f.type}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-400">{f.location}</td>
                                            <td className="px-5 py-3.5 text-slate-400">{f.capacity || '—'}</td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={() => toggleStatus(f)}
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${f.status === 'ACTIVE'
                                                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                                                        : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                                                        }`}
                                                >
                                                    {f.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(f)}
                                                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                            <path d="m15 5 4 4" />
                                                        </svg>
                                                    </button>
                                                    {deleteConfirm === f.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDelete(f.id)}
                                                                className="px-2.5 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-500 cursor-pointer transition-colors"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-2.5 py-1 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600 cursor-pointer transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(f.id)}
                                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-all cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M3 6h18" />
                                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                                <line x1="10" x2="10" y1="11" y2="17" />
                                                                <line x1="14" x2="14" y1="11" y2="17" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Create / Edit Modal ──────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>

                    {/* Modal */}
                    <div className="relative bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-6">
                                {editing ? 'Edit Facility' : 'Add New Facility'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Name *</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Room A101"
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Type *</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                    >
                                        {TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Description</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Brief description of the facility..."
                                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    />
                                </div>

                                {/* Location + Capacity */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Location *</label>
                                        <input
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Building A, Floor 2"
                                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Capacity</label>
                                        <input
                                            name="capacity"
                                            type="number"
                                            value={form.capacity}
                                            onChange={handleChange}
                                            min="0"
                                            placeholder="e.g. 50"
                                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Facility Image</label>
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-40 object-cover rounded-xl border border-slate-600/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 6 6 18" />
                                                    <path d="m6 6 12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onDrop={handleFileDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${uploading
                                                    ? 'border-blue-500/50 bg-blue-500/5'
                                                    : 'border-slate-600/50 hover:border-blue-500/40 hover:bg-slate-700/30'
                                                }`}
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-blue-400 text-xs font-medium">Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="text-slate-500" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" x2="12" y1="3" y2="15" />
                                                    </svg>
                                                    <span className="text-slate-500 text-xs">Drag & drop or click to upload</span>
                                                    <span className="text-slate-600 text-[10px]">PNG, JPG up to 10MB</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {/* Availability Windows */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-slate-400 text-sm font-medium">Availability Windows</label>
                                        <button
                                            type="button"
                                            onClick={addAvailabilityWindow}
                                            className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer transition-colors"
                                        >
                                            + Add Window
                                        </button>
                                    </div>
                                    {form.availabilityWindows.map((w, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-2">
                                            <select
                                                value={w.dayOfWeek}
                                                onChange={(e) => updateAvailabilityWindow(i, 'dayOfWeek', e.target.value)}
                                                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-xs focus:outline-none cursor-pointer"
                                            >
                                                {DAYS.map(d => (
                                                    <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="time"
                                                value={w.startTime}
                                                onChange={(e) => updateAvailabilityWindow(i, 'startTime', e.target.value)}
                                                className="px-2 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-xs focus:outline-none"
                                            />
                                            <span className="text-slate-500 text-xs">to</span>
                                            <input
                                                type="time"
                                                value={w.endTime}
                                                onChange={(e) => updateAvailabilityWindow(i, 'endTime', e.target.value)}
                                                className="px-2 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-xs focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeAvailabilityWindow(i)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 6 6 18" />
                                                    <path d="m6 6 12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        {submitting ? 'Saving...' : editing ? 'Update Facility' : 'Create Facility'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
