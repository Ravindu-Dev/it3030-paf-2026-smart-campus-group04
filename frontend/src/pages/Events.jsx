import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';
import toast from 'react-hot-toast';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await getEvents();
            setEvents(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto pt-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                        Campus <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Events</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">Discover workshops, seminars, and social gatherings happening on campus.</p>
                    <Link
                        to="/events/calendar"
                        className="inline-flex items-center gap-2 mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Calendar View
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-24 bg-slate-800/40 rounded-3xl border border-slate-800">
                        <div className="text-6xl mb-6">📅</div>
                        <h2 className="text-2xl font-bold text-white mb-2">No Upcoming Events</h2>
                        <p className="text-slate-400 max-w-md mx-auto">Check back later for new events happening on campus or view past events in the archive.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EventCard({ event }) {
    const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <Link
            to={`/events/${event.id}`}
            className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col h-full"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 backdrop-blur-md text-white text-xs font-bold rounded-lg uppercase tracking-wider ${event.status === 'ONGOING' ? 'bg-emerald-600/90' : 'bg-blue-600/90'
                        }`}>
                        {event.status}
                    </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {event.title}
                </h3>
                <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formattedDate} • {event.startTime.substring(0, 5)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Registrations</span>
                        <span className="text-slate-300 font-medium">
                            {event.participantCount} / {event.capacity}
                        </span>
                    </div>
                    <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-1000"
                            style={{ width: `${Math.min((event.participantCount / event.capacity) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
