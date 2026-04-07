import { useState, useEffect, useRef } from 'react';
import { getAllEventsAdmin, createEvent, updateEvent, deleteEvent } from '../services/eventService';
import { uploadImage } from '../services/imageService';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const emptyForm = {
    title: '',
    description: '',
    location: '',
    eventDate: '',
    startTime: '09:00',
    endTime: '17:00',
    capacity: 100,
    imageUrl: '',
    status: 'UPCOMING',
};

const today = new Date().toISOString().split('T')[0];

export default function ManageEvents({ standalone = false }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [visibleEvents, setVisibleEvents] = useState(6);
    const fileInputRef = useRef(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await getAllEventsAdmin();
            setEvents(res.data.data || []);
            setVisibleEvents(6);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const openCreateModal = () => {
        setEditing(null);
        setForm({ ...emptyForm });
        setImagePreview('');
        setShowModal(true);
    };

    const openEditModal = (event) => {
        setEditing(event);
        setForm({
            title: event.title || '',
            description: event.description || '',
            location: event.location || '',
            eventDate: event.eventDate || '',
            startTime: event.startTime || '09:00',
            endTime: event.endTime || '17:00',
            capacity: event.capacity || 100,
            imageUrl: event.imageUrl || '',
            status: event.status || 'UPCOMING',
        });
        setImagePreview(event.imageUrl || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ ...emptyForm });
        setImagePreview('');
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        try {
            setUploading(true);
            const url = await uploadImage(file);
            setForm(prev => ({ ...prev, imageUrl: url }));
            setImagePreview(url);
            toast.success('Image uploaded!');
        } catch (err) {
            toast.error('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editing) {
                await updateEvent(editing.id, form);
                toast.success('Event updated');
            } else {
                await createEvent(form);
                toast.success('Event created');
            }
            closeModal();
            fetchEvents();
        } catch (err) {
            toast.error('Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await deleteEvent(id);
                toast.success('Event deleted');
                fetchEvents();
            } catch (err) {
                toast.error('Failed to delete event');
            }
        }
    };

    return (
        <div className={standalone ? "" : "min-h-screen bg-slate-900 py-8 px-4"}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Event Management</h1>
                        <p className="text-slate-400">Create and oversee campus activities</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                    >
                        + Create Event
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-700/50 text-slate-400 font-medium">
                                    <th className="px-6 py-4">Event</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Participants</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {events.slice(0, visibleEvents).map(event => (
                                    <tr key={event.id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{event.title}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {event.eventDate} <br />
                                            <span className="text-xs text-slate-500">{event.startTime} - {event.endTime}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{event.location}</td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {event.participantCount} / {event.capacity}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-400' :
                                                event.status === 'ONGOING' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    event.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                                                        'bg-slate-500/10 text-slate-400'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openEditModal(event)} className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(event.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {events.length > 6 && (
                            <div className="relative pt-10 pb-6 bg-slate-800/40 border-t border-slate-700/30">
                                {visibleEvents < events.length && (
                                    <div className="absolute top-0 left-0 right-0 h-24 bg-linear-to-t from-slate-900/80 to-transparent pointer-events-none -translate-y-full" />
                                )}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-1.5 p-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl backdrop-blur-xl shadow-2xl">
                                        {visibleEvents < events.length ? (
                                            <button 
                                                onClick={() => setVisibleEvents(prev => Math.min(prev + 6, events.length))}
                                                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                            >
                                                <span>View More Events</span>
                                                <svg className="w-4 h-4 text-blue-500 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => setVisibleEvents(6)}
                                                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/3 hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-[0.98] cursor-pointer"
                                            >
                                                <span>Collapse List</span>
                                                <svg className="w-4 h-4 text-blue-500 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="h-4 w-px bg-slate-800 mx-1" />
                                        <div className="px-4 py-1 flex items-center gap-2 font-mono">
                                            <span className="text-white text-xs font-bold">{Math.min(visibleEvents, events.length)}</span>
                                            <span className="text-slate-600 text-[10px] font-black uppercase tracking-tighter">/</span>
                                            <span className="text-slate-500 text-xs font-medium">{events.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">{editing ? 'Edit Event' : 'Create New Event'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Title</label>
                                        <input required className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100"
                                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Location</label>
                                        <input required className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100"
                                            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-slate-400 text-sm font-medium mb-1.5">Date</label>
                                            <input type="date" required
                                                min={today}
                                                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 scheme-dark opacity-100"
                                                value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm font-medium mb-1.5">Capacity</label>
                                            <input type="number" required className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100"
                                                value={form.capacity} onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-slate-400 text-sm font-medium mb-1.5">Start Time</label>
                                            <input type="time" required className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 scheme-dark opacity-100"
                                                value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm font-medium mb-1.5">End Time</label>
                                            <input type="time" required className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 scheme-dark opacity-100"
                                                value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Description</label>
                                        <textarea rows={4} className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 opacity-100"
                                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm font-medium mb-1.5">Event Image</label>
                                        <div className="relative group aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center cursor-pointer"
                                            onClick={() => fileInputRef.current.click()}>
                                            {imagePreview ? (
                                                <img src={imagePreview} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-slate-500 text-center">
                                                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span className="text-xs">Click to upload image</span>
                                                </div>
                                            )}
                                            {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-700">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={submitting || uploading} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                                    {submitting ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
