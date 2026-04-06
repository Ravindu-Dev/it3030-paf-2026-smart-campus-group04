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
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header / Hero */}
            <div className="pt-32 pb-20 text-center px-4 sm:px-6 lg:px-8 relative z-10 border-b border-slate-800/50 mb-10">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
                    Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Calendar</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto drop-shadow-md">
                    Plan your schedule and browse upcoming campus activities
                </p>
                <Link
                    to="/events"
                    className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border border-blue-500/50 text-white rounded-xl font-bold transition-all duration-300 shadow-xl shadow-blue-600/20 hover:shadow-blue-500/40 hover:-translate-y-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Events
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-12">

                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="flex items-center gap-4 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <h2 className="text-lg font-bold text-white px-4 min-w-[160px] text-center">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer">
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
