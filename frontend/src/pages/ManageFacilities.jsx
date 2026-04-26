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

const TYPE_ICONS = {
    LECTURE_HALL: '🏫',
    LAB: '🔬',
    MEETING_ROOM: '🤝',
    PROJECTOR: '📽️',
    CAMERA: '📷',
    OTHER_EQUIPMENT: '🔧',
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

const TYPE_FILTER_OPTIONS = [
    { value: '', label: 'All Types' },
    ...TYPE_OPTIONS,
];

export default function ManageFacilities({ standalone = false }) {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // null = create, object = edit
    const [form, setForm] = useState({ ...emptyForm });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [detailFacility, setDetailFacility] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const [formErrors, setFormErrors] = useState({});

    const validateFacilityForm = () => {
        const errors = {};
        // Name validation
        if (!form.name || form.name.trim().length === 0) {
            errors.name = 'Facility name is required';
        } else if (form.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (form.name.trim().length > 100) {
            errors.name = 'Name must not exceed 100 characters';
        }
        // Type validation
        if (!form.type) {
            errors.type = 'Facility type is required';
        }
        // Description validation
        if (form.description && form.description.length > 500) {
            errors.description = 'Description must not exceed 500 characters';
        }
        // Location validation
        if (!form.location || form.location.trim().length === 0) {
            errors.location = 'Location is required';
        } else if (form.location.trim().length < 2) {
            errors.location = 'Location must be at least 2 characters';
        } else if (form.location.trim().length > 200) {
            errors.location = 'Location must not exceed 200 characters';
        }
        // Capacity validation
        if (form.capacity !== '' && form.capacity !== null && form.capacity !== undefined) {
            const cap = parseInt(form.capacity);
            if (isNaN(cap) || cap < 1) {
                errors.capacity = 'Capacity must be at least 1';
            } else if (cap > 10000) {
                errors.capacity = 'Capacity must not exceed 10,000';
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Search & filter state
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;

            const res = await getAllFacilities(params);
            setFacilities(res.data.data || []);
        } catch {
            toast.error('Failed to load facilities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, [typeFilter, statusFilter]);

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
        setFormErrors({});
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
        if (!validateFacilityForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
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
            // Handle backend validation errors
            if (err.response?.data?.data && typeof err.response.data.data === 'object') {
                setFormErrors(err.response.data.data);
                toast.error('Validation failed — check highlighted fields');
            } else {
                const msg = err.response?.data?.message || 'Operation failed';
                toast.error(msg);
            }
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

    // ─── Search handler ──────────────────────────────────────────────

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFacilities();
    };

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setStatusFilter('');
        setTimeout(() => fetchFacilities(), 0);
    };

    return (
        <div className={standalone ? "" : "min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900"}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${standalone ? "py-0" : "py-8"}`}>
                {/* Header */}
                {!standalone && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Link to={standalone ? "/dashboard" : "/facilities"} className="text-slate-400 hover:text-white transition-colors">
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 text-sm cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                        Add Facility
                    </button>
                    </div>
                )}

                {/* Add Facility button for standalone mode */}
                {standalone && (
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-slate-400 text-sm">{facilities.length} {facilities.length === 1 ? 'facility' : 'facilities'} total</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 text-sm cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                            Add Facility
                        </button>
                    </div>
                )}

                {/* ─── Search & Filter Bar ────────────────────────────────── */}
                <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 mb-8">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Search bar */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.3-4.3" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search facilities by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all opacity-100"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                            >
                                Search
                            </button>
                        </div>

                        {/* Filter row */}
                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none scheme-dark outline-none"
                            >
                                {TYPE_FILTER_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none scheme-dark outline-none"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Active filters indicator */}
                        {(search || typeFilter || statusFilter) && (
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-xs">Active filters</span>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* ─── Facilities Grid with Images ────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : facilities.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                            <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m4.5-18v18m4.5-18v18m4.5-18v18m3-18v18M5.25 3h13.5M5.25 21h13.5M5.25 12h13.5" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No facilities found</h3>
                        <p className="text-slate-400 mb-6">
                            {search || typeFilter || statusFilter
                                ? 'Try adjusting your search or filters'
                                : 'Get started by adding your first campus resource'}
                        </p>
                        {!search && !typeFilter && !statusFilter && (
                            <button
                                onClick={openCreateModal}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors cursor-pointer"
                            >
                                Add First Facility
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {facilities.map(f => {
                            const isActive = f.status === 'ACTIVE';
                            return (
                                <div key={f.id} className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                                    {/* Image or placeholder — opens detail popup */}
                                    <button onClick={() => setDetailFacility(f)} className="block w-full text-left cursor-pointer">
                                        <div className="h-40 bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center relative overflow-hidden">
                                            {f.imageUrl ? (
                                                <img
                                                    src={f.imageUrl}
                                                    alt={f.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-300">
                                                    {TYPE_ICONS[f.type] || '🏢'}
                                                </span>
                                            )}

                                            {/* Status badge */}
                                            <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${isActive
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {isActive ? 'Active' : 'Out of Service'}
                                            </span>

                                            {/* Type badge */}
                                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/70 backdrop-blur-sm rounded-full text-xs font-medium text-slate-300 border border-slate-600/30">
                                                {TYPE_LABELS[f.type] || f.type}
                                            </span>

                                            {/* View detail overlay on hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium border border-white/20">
                                                    View Details
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Info */}
                                    <div className="p-4 space-y-2">
                                        <button onClick={() => setDetailFacility(f)} className="cursor-pointer text-left">
                                            <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors leading-tight">
                                                {f.name}
                                            </h3>
                                        </button>

                                        {f.description && (
                                            <p className="text-slate-400 text-sm line-clamp-2">
                                                {f.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 pt-1">
                                            {/* Location */}
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {f.location}
                                            </div>

                                            {/* Capacity */}
                                            {f.capacity && (
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                        <circle cx="9" cy="7" r="4" />
                                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                    </svg>
                                                    {f.capacity} seats
                                                </div>
                                            )}
                                        </div>

                                        {/* Admin Action Buttons */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30 mt-2">
                                            <button
                                                onClick={() => toggleStatus(f)}
                                                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                                    }`}
                                            >
                                                {isActive ? '● Active' : '● Out of Service'}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(f)}
                                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer border border-slate-700/30 hover:border-blue-500/30"
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
                                                        className="px-2.5 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-500 cursor-pointer transition-colors font-medium"
                                                    >
                                                        Yes
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="px-2.5 py-2 bg-slate-700 text-white text-xs rounded-lg hover:bg-slate-600 cursor-pointer transition-colors font-medium"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(f.id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer border border-slate-700/30 hover:border-red-500/30"
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Facility Detail Popup ──────────────────────────────── */}
            {detailFacility && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailFacility(null)}></div>

                    {/* Modal */}
                    <div className="relative bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Close button */}
                        <button
                            onClick={() => setDetailFacility(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-slate-900/70 backdrop-blur-sm hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-600/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </button>

                        {/* Hero Image */}
                        <div className="h-56 sm:h-64 bg-linear-to-br from-slate-700 to-slate-800 flex items-center justify-center relative overflow-hidden">
                            {detailFacility.imageUrl ? (
                                <img
                                    src={detailFacility.imageUrl}
                                    alt={detailFacility.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-7xl opacity-40">
                                    {TYPE_ICONS[detailFacility.type] || '🏢'}
                                </span>
                            )}
                            {/* Gradient overlay at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-slate-800 to-transparent" />
                            {/* Status badge */}
                            <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${detailFacility.status === 'ACTIVE'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                {detailFacility.status === 'ACTIVE' ? '● Active' : '● Out of Service'}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="p-6 -mt-8 relative">
                            {/* Title & Type */}
                            <div className="mb-5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-3">
                                    {TYPE_ICONS[detailFacility.type] || '🏢'} {TYPE_LABELS[detailFacility.type] || detailFacility.type}
                                </span>
                                <h2 className="text-2xl font-bold text-white">{detailFacility.name}</h2>
                            </div>

                            {/* Description */}
                            {detailFacility.description && (
                                <div className="mb-5">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{detailFacility.description}</p>
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                                {/* Location */}
                                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location</span>
                                    </div>
                                    <p className="text-white text-sm font-medium">{detailFacility.location || '—'}</p>
                                </div>

                                {/* Capacity */}
                                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Capacity</span>
                                    </div>
                                    <p className="text-white text-sm font-medium">{detailFacility.capacity ? `${detailFacility.capacity} seats` : '—'}</p>
                                </div>

                                {/* Status */}
                                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${detailFacility.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                                    </div>
                                    <p className={`text-sm font-medium ${detailFacility.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {detailFacility.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                                    </p>
                                </div>

                                {/* Type */}
                                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                                            <path d="M2.25 21h19.5M3.75 3v18m4.5-18v18m4.5-18v18m4.5-18v18m3-18v18" />
                                        </svg>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Type</span>
                                    </div>
                                    <p className="text-white text-sm font-medium">{TYPE_LABELS[detailFacility.type] || detailFacility.type}</p>
                                </div>

                                {/* Created */}
                                {detailFacility.createdAt && (
                                    <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Created</span>
                                        </div>
                                        <p className="text-white text-sm font-medium">{new Date(detailFacility.createdAt).toLocaleDateString()}</p>
                                    </div>
                                )}

                                {/* Updated */}
                                {detailFacility.updatedAt && (
                                    <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                            </svg>
                                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Updated</span>
                                        </div>
                                        <p className="text-white text-sm font-medium">{new Date(detailFacility.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Availability Windows */}
                            {detailFacility.availabilityWindows && detailFacility.availabilityWindows.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Availability Schedule</h4>
                                    <div className="space-y-2">
                                        {detailFacility.availabilityWindows.map((w, i) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-700/30 border border-slate-600/30 rounded-xl px-4 py-2.5">
                                                <span className="text-white text-sm font-medium">
                                                    {w.dayOfWeek.charAt(0) + w.dayOfWeek.slice(1).toLowerCase()}
                                                </span>
                                                <span className="text-slate-400 text-sm">
                                                    {w.startTime} — {w.endTime}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Facility ID */}
                            {detailFacility.id && (
                                <div className="mb-5">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Facility ID</h4>
                                    <p className="text-slate-400 text-xs font-mono bg-slate-700/30 border border-slate-600/30 rounded-lg px-3 py-2 inline-block">{detailFacility.id}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={() => { setDetailFacility(null); openEditModal(detailFacility); }}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                    </svg>
                                    Edit Facility
                                </button>
                                <button
                                    onClick={() => setDetailFacility(null)}
                                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                        onChange={(e) => { handleChange(e); if (formErrors.name) setFormErrors(prev => ({...prev, name: ''})); }}
                                        required
                                        maxLength={100}
                                        placeholder="e.g. Room A101"
                                        className={`w-full px-4 py-2.5 bg-slate-900/80 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100 ${formErrors.name ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`}
                                    />
                                    {formErrors.name && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.name}</p>}
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1.5">Type *</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer scheme-dark outline-none"
                                    >
                                        {TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-slate-400 text-sm font-medium">Description</label>
                                        <span className={`text-xs ${(form.description?.length || 0) > 450 ? 'text-amber-400' : 'text-slate-600'}`}>{form.description?.length || 0}/500</span>
                                    </div>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={(e) => { handleChange(e); if (formErrors.description) setFormErrors(prev => ({...prev, description: ''})); }}
                                        rows={3}
                                        maxLength={500}
                                        placeholder="Brief description of the facility..."
                                        className={`w-full px-4 py-2.5 bg-slate-900/80 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none opacity-100 ${formErrors.description ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`}
                                    />
                                    {formErrors.description && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.description}</p>}
                                </div>

                                {/* Location + Capacity */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Location *</label>
                                        <input
                                            name="location"
                                            value={form.location}
                                            onChange={(e) => { handleChange(e); if (formErrors.location) setFormErrors(prev => ({...prev, location: ''})); }}
                                            required
                                            maxLength={200}
                                            placeholder="e.g. Building A, Floor 2"
                                            className={`w-full px-4 py-2.5 bg-slate-900/80 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100 ${formErrors.location ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`}
                                        />
                                        {formErrors.location && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.location}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Capacity</label>
                                        <input
                                            name="capacity"
                                            type="number"
                                            value={form.capacity}
                                            onChange={(e) => { handleChange(e); if (formErrors.capacity) setFormErrors(prev => ({...prev, capacity: ''})); }}
                                            min="1"
                                            max="10000"
                                            placeholder="e.g. 50"
                                            className={`w-full px-4 py-2.5 bg-slate-900/80 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100 ${formErrors.capacity ? 'border-red-500/70 ring-1 ring-red-500/30' : 'border-slate-800'}`}
                                        />
                                        {formErrors.capacity && <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.capacity}</p>}
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
                                                className="flex-1 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-white text-xs focus:outline-none cursor-pointer scheme-dark outline-none"
                                            >
                                                {DAYS.map(d => (
                                                    <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="time"
                                                value={w.startTime}
                                                onChange={(e) => updateAvailabilityWindow(i, 'startTime', e.target.value)}
                                                className="px-2 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-white text-xs focus:outline-none scheme-dark"
                                            />
                                            <span className="text-slate-500 text-xs">to</span>
                                            <input
                                                type="time"
                                                value={w.endTime}
                                                onChange={(e) => updateAvailabilityWindow(i, 'endTime', e.target.value)}
                                                className="px-2 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-white text-xs focus:outline-none scheme-dark"
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
