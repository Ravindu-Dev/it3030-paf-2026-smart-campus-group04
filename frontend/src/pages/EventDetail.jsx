import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById, registerForEvent, cancelRegistration } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function EventDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const res = await getEventById(id);
            setEvent(res.data.data);
        } catch (err) {
            toast.error('Failed to load event details');
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            setActionLoading(true);
            await registerForEvent(id);
            toast.success('Joined event!');
            fetchEvent();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setActionLoading(true);
            await cancelRegistration(id);
            toast.success('Registration cancelled');
            fetchEvent();
        } catch (err) {
            toast.error('Failed to cancel registration');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!event) return null;

    const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const isFull = event.participantCount >= event.capacity;
    
    // Improved check: Event is overdue if status is COMPLETED OR if current time is past event end time
    const eventEndTime = new Date(`${event.eventDate}T${event.endTime}`);
    const isOverdue = event.status === 'COMPLETED' || new Date() > eventEndTime;

    return (
        <div className="min-h-screen bg-slate-900 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/events" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group">
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Events
                </Link>

                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="relative h-[400px]">
                        <img
                            src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'}
                            className="w-full h-full object-cover"
                            alt={event.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8">
                            <span className={`inline-block px-4 py-1.5 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-widest shadow-lg ${event.status === 'ONGOING' ? 'bg-emerald-600 shadow-emerald-600/40' : 'bg-blue-600 shadow-blue-600/40'
                                }`}>
                                {event.status}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                                {event.title}
                            </h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">About this Event</h2>
                                    <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                                        {event.description || 'No description available for this event.'}
                                    </p>
                                </section>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/30">
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Capacity</p>
                                        <p className="text-white text-xl font-bold">{event.capacity} Spots</p>
                                    </div>
                                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/30">
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Attendees</p>
                                        <p className="text-emerald-400 text-xl font-bold">{event.participantCount} Joined</p>
                                    </div>
                                </div>
                            </div>

                            <aside className="space-y-6">
                                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 sticky top-32">
                                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Event Details
                                    </h3>

                                    <div className="space-y-5 mb-8">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-medium">Date</p>
                                                <p className="text-slate-200 text-sm font-semibold">{formattedDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-medium">Time</p>
                                                <p className="text-slate-200 text-sm font-semibold">{event.startTime} - {event.endTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs font-medium">Location</p>
                                                <p className="text-slate-200 text-sm font-semibold">{event.location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {event.isRegistered ? (
                                        <button
                                            onClick={handleCancel}
                                            disabled={actionLoading || isOverdue}
                                            className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl font-bold transition-all border border-red-500/20 disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Processing...' : 'Cancel Registration'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleRegister}
                                            disabled={actionLoading || isFull || event.status === 'CANCELLED' || isOverdue}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-transparent text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                                        >
                                            {actionLoading ? 'Processing...' : isFull ? 'Event Full' : isOverdue ? 'Event Ended' : 'Join Event Now'}
                                        </button>
                                    )}
                                    {isFull && !event.isRegistered && (
                                        <p className="text-red-400 text-center text-xs mt-3 font-medium flex items-center justify-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            All spots are currently filled
                                        </p>
                                    )}
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
