import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';
import toast from 'react-hot-toast';

export default function EventCalendarPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await getEvents(true);
            setEvents(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const renderCalendar = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const totalDays = daysInMonth(month, year);
        const startDay = firstDayOfMonth(month, year);
        const days = [];

        // Padding for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-slate-900/20 border border-slate-800/50"></div>);
        }

        // Days of current month
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.eventDate === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div key={day} className={`h-32 border border-slate-700/30 p-2 overflow-y-auto hover:bg-slate-800/40 transition-colors ${isToday ? 'bg-blue-600/5 ring-1 ring-inset ring-blue-500/20' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-semibold ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-blue-500/20' : 'text-slate-500'}`}>
                            {day}
                        </span>
                    </div>
                    {dayEvents.map(event => {
                        let colorClass = 'bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20';

                        if (event.status === 'COMPLETED') {
                            colorClass = 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20';
                        } else if (event.status === 'ONGOING') {
                            colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20';
                        }

                        return (
                            <Link
                                key={event.id}
                                to={`/events/${event.id}`}
                                className={`block text-[10px] p-1 border rounded transition-colors truncate ${colorClass}`}
                                title={event.title}
                            >
                                {event.startTime.substring(0, 5)} {event.title}
                            </Link>
                        );
                    })}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="min-h-screen bg-slate-900 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Link to="/events" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </Link>
                            <h1 className="text-3xl font-extrabold text-white">Event Calendar</h1>
                        </div>
                        <p className="text-slate-400 pl-14">Plan your schedule and browse upcoming campus activities</p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-700 text-white rounded-xl transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h2 className="text-lg font-bold text-white px-4 min-w-[160px] text-center">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-700 text-white rounded-xl transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-48">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="grid grid-cols-7 bg-slate-700/20 border-b border-slate-700/50">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                                <div key={day} className="py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {renderCalendar()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
