import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTicketById, addComment, getComments, updateComment, deleteComment, updateTicketStatus, rejectTicket, assignTechnician, deleteTicket } from '../services/ticketService';
import { getTechnicians } from '../services/ticketService';
import toast from 'react-hot-toast';

/** Format milliseconds into a human-readable duration string */
function formatDuration(ms) {
    if (ms == null || ms < 0) return '—';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
}

/** Custom hook: returns live elapsed ms from a start ISO string, re-renders every second while active */
function useLiveElapsed(startIso, active) {
    const [elapsed, setElapsed] = useState(null);
    const intervalRef = useRef(null);
    useEffect(() => {
        if (!active || !startIso) { setElapsed(null); return; }
        const start = new Date(startIso).getTime();
        const tick = () => setElapsed(Date.now() - start);
        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => clearInterval(intervalRef.current);
    }, [startIso, active]);
    return elapsed;
}

const STATUS_CONFIG = {
    OPEN: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', icon: '📬' },
    IN_PROGRESS: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', icon: '🔧' },
    RESOLVED: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', icon: '✅' },
    CLOSED: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', dot: 'bg-slate-400', icon: '📁' },
    REJECTED: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400', icon: '❌' },
};

const PRIORITY_CONFIG = {
    LOW: { color: 'text-slate-400', bg: 'bg-slate-500/20 border-slate-500/30' },
    MEDIUM: { color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
    HIGH: { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
};

const WORKFLOW_STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function TicketDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    // Modals
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechId, setSelectedTechId] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTicket();
        fetchComments();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const res = await getTicketById(id);
            setTicket(res.data.data);
        } catch (err) {
            toast.error('Failed to load ticket');
            navigate('/profile', { state: { tab: 'tickets' } });
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await getComments(id);
            setComments(res.data.data || []);
        } catch (err) {
            console.error('Failed to load comments', err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmittingComment(true);
        try {
            await addComment(id, { content: newComment });
            setNewComment('');
            fetchComments();
            toast.success('Comment added');
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) return;
        try {
            await updateComment(id, commentId, { content: editContent });
            setEditingComment(null);
            fetchComments();
            toast.success('Comment updated');
        } catch (err) {
            toast.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await deleteComment(id, commentId);
            fetchComments();
            toast.success('Comment deleted');
        } catch (err) {
            toast.error('Failed to delete comment');
        }
    };

    const handleAssign = async () => {
        if (!selectedTechId) return;
        setActionLoading(true);
        try {
            const res = await assignTechnician(id, { technicianId: selectedTechId });
            setTicket(res.data.data);
            setShowAssignModal(false);
            toast.success('Technician assigned');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to assign');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Rejection reason is required');
            return;
        }
        setActionLoading(true);
        try {
            const res = await rejectTicket(id, { remarks: rejectReason });
            setTicket(res.data.data);
            setShowRejectModal(false);
            toast.success('Ticket rejected');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        try {
            const res = await updateTicketStatus(id, newStatus);
            setTicket(res.data.data);
            toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;
        try {
            await deleteTicket(id);
            toast.success('Ticket deleted');
            navigate('/profile', { state: { tab: 'tickets' } });
        } catch (err) {
            toast.error('Failed to delete ticket');
        }
    };

    const openAssignModal = async () => {
        setShowAssignModal(true);
        try {
            const res = await getTechnicians();
            setTechnicians(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load technicians');
        }
    };

    const isAdmin = user?.role === 'ADMIN';
    const isManager = user?.role === 'MANAGER';
    const isTechnician = user?.role === 'TECHNICIAN';
    const canAssign = isAdmin || isManager;
    const canReject = isAdmin;
    const canUpdateStatus = isAdmin || isTechnician;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    const currentStepIndex = WORKFLOW_STEPS.indexOf(ticket.status);

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden pt-28 pb-10">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 -left-1/4 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
                {/* Back Nav */}
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-8 bg-slate-800/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-700/50 hover:border-amber-500/50 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back
                </button>

                {/* Header Card */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_CONFIG[ticket.status]?.color}`}>
                                    {STATUS_CONFIG[ticket.status]?.icon} {ticket.status.replace('_', ' ')}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${PRIORITY_CONFIG[ticket.priority]?.bg} ${PRIORITY_CONFIG[ticket.priority]?.color}`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">{ticket.facilityName}</h1>
                            <p className="text-slate-400 text-sm mt-1">{ticket.category?.replace('_', ' ')} • Created {new Date(ticket.createdAt).toLocaleDateString()} by {ticket.userName}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {canAssign && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && ticket.status !== 'RESOLVED' && (
                                <button onClick={openAssignModal} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${!ticket.assignedTechnicianId
                                    ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                    : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                    }`}>
                                    {ticket.assignedTechnicianId ? '🔄 Reassign' : '🔧 Assign'}
                                </button>
                            )}
                            {canUpdateStatus && ticket.status === 'IN_PROGRESS' && (
                                <button onClick={() => handleStatusUpdate('RESOLVED')} disabled={actionLoading} className="px-5 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-40 border border-emerald-500/30 hover:border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    Resolve
                                </button>
                            )}
                            {canUpdateStatus && ticket.status === 'RESOLVED' && (
                                <button onClick={() => handleStatusUpdate('CLOSED')} disabled={actionLoading} className="px-5 py-2.5 bg-slate-500/20 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-500/30 transition-all cursor-pointer disabled:opacity-40 border border-slate-500/30 hover:border-slate-400/50 shadow-[0_0_15px_rgba(100,116,139,0.15)] flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                    Close
                                </button>
                            )}
                            {canReject && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && !ticket.assignedTechnicianId && (
                                <button onClick={() => setShowRejectModal(true)} className="px-5 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all cursor-pointer border border-red-500/20 hover:border-red-500/40 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    Reject
                                </button>
                            )}
                            {isAdmin && (
                                <button onClick={handleDelete} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer border border-red-500/20 group ml-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:scale-110 transition-transform"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Workflow Progress */}
                {ticket.status !== 'REJECTED' && (
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
                        <h3 className="text-sm font-medium text-slate-400 mb-4">Ticket Workflow</h3>
                        <div className="flex items-center justify-between">
                            {WORKFLOW_STEPS.map((step, i) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-300 ${i <= currentStepIndex
                                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/50 scale-110'
                                            : 'bg-slate-800/50 border border-slate-700 text-slate-500'
                                            }`}>
                                            {i < currentStepIndex ? '✓' : STATUS_CONFIG[step]?.icon}
                                        </div>
                                        <span className={`text-[10px] sm:text-xs mt-4 font-bold uppercase tracking-wider ${i <= currentStepIndex ? 'text-amber-400 glow-text' : 'text-slate-500'}`}>
                                            {step.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {i < WORKFLOW_STEPS.length - 1 && (
                                        <div className="flex-1 px-2 sm:px-4 mt-[-24px]">
                                            <div className={`h-1 w-full rounded-full transition-colors duration-500 ${i < currentStepIndex ? 'bg-gradient-to-r from-amber-500 to-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-700'}`} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rejection Notice */}
                {ticket.status === 'REJECTED' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-red-400 text-lg">❌</span>
                            <h3 className="text-red-400 font-semibold">Ticket Rejected</h3>
                        </div>
                        <p className="text-red-300/80 text-sm">{ticket.rejectionReason}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.3)] hover:border-slate-600/50 transition-all">
                            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-3">
                                <span className="p-2 bg-blue-500/20 rounded-lg text-blue-400 border border-blue-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                </span>
                                Description
                            </h3>
                            <p className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                        </div>

                        {/* Evidence Images */}
                        {ticket.imageUrls?.length > 0 && (
                            <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.3)] hover:border-slate-600/50 transition-all">
                                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-3">
                                    <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/30">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                    </span>
                                    Evidence ({ticket.imageUrls.length} images)
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {ticket.imageUrls.map((url, i) => (
                                        <img
                                            key={i}
                                            src={url}
                                            alt={`Evidence ${i + 1}`}
                                            className="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity border border-slate-600/50"
                                            onClick={() => setSelectedImage(url)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resolution Notes */}
                        {ticket.resolutionNotes && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                <h3 className="text-emerald-400 font-semibold text-lg mb-3 flex items-center gap-3">
                                    <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                    </span>
                                    Resolution Notes
                                </h3>
                                <p className="text-emerald-100/90 text-[15px] leading-relaxed">{ticket.resolutionNotes}</p>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(0,0,0,0.3)] hover:border-slate-600/50 transition-all">
                            <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-3">
                                <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 border border-indigo-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                </span>
                                Comments ({comments.length})
                            </h3>

                            {/* Comment List */}
                            <div className="space-y-4 mb-6">
                                {comments.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">No comments yet</p>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                            {comment.userProfilePicture ? (
                                                <img src={comment.userProfilePicture} alt="" className="w-8 h-8 rounded-full flex-shrink-0 border border-slate-600" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                                                    {comment.userName?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white text-sm font-medium">{comment.userName}</span>
                                                    <span className="px-1.5 py-0.5 bg-slate-700/80 text-slate-400 text-[10px] rounded-full">{comment.userRole}</span>
                                                    <span className="text-slate-500 text-xs">{new Date(comment.createdAt).toLocaleString()}</span>
                                                </div>

                                                {editingComment === comment.id ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                                                        />
                                                        <button onClick={() => handleEditComment(comment.id)} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs hover:bg-amber-500/30 cursor-pointer">Save</button>
                                                        <button onClick={() => setEditingComment(null)} className="px-3 py-1.5 text-slate-400 rounded-lg text-xs hover:text-white cursor-pointer">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-slate-300 text-sm">{comment.content}</p>
                                                        {(comment.userId === user?.id || isAdmin) && (
                                                            <div className="flex gap-2 mt-1">
                                                                {comment.userId === user?.id && (
                                                                    <button
                                                                        onClick={() => { setEditingComment(comment.id); setEditContent(comment.content); }}
                                                                        className="text-slate-500 text-xs hover:text-amber-400 cursor-pointer"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-500 text-xs hover:text-red-400 cursor-pointer">
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add Comment */}
                            <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                                <input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={submittingComment || !newComment.trim()}
                                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-sm font-medium hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-40 cursor-pointer"
                                >
                                    {submittingComment ? '...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Ticket Info */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-lg">
                            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 border border-slate-600/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                </span>
                                Details
                            </h3>
                            <div className="space-y-3">
                                <InfoRow label="Ticket ID" value={<span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded shadow-inner text-amber-400/90">{ticket.id?.slice(-8)}</span>} />
                                <InfoRow label="Category" value={ticket.category?.replace('_', ' ')} />
                                <InfoRow label="Priority" value={<span className={PRIORITY_CONFIG[ticket.priority]?.color}>{ticket.priority}</span>} />
                                <InfoRow label="Facility" value={ticket.facilityName} />
                                <InfoRow label="Location" value={ticket.location} />
                                <InfoRow label="Created" value={new Date(ticket.createdAt).toLocaleString()} />
                                <InfoRow label="Updated" value={new Date(ticket.updatedAt).toLocaleString()} />
                            </div>
                        </div>

                        {/* Reporter */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-lg">
                            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                Reporter
                            </h3>
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                                <p className="text-white font-medium mb-1">{ticket.userName}</p>
                                <p className="text-slate-400 text-sm flex items-center gap-2 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                    {ticket.userEmail}
                                </p>
                                {ticket.contactPhone && (
                                    <p className="text-slate-400 text-sm flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                        {ticket.contactPhone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Assigned Technician */}
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>
                            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3 relative z-10">
                                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                                </span>
                                Assigned Tech
                            </h3>
                            <div className="relative z-10">
                                {ticket.assignedTechnicianName ? (
                                    <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                                        <p className="text-blue-400 font-bold text-[15px]">{ticket.assignedTechnicianName}</p>
                                        <p className="text-blue-300/60 text-xs mt-1">Assigned by admin/manager</p>
                                    </div>
                                ) : (
                                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                                        <p className="text-slate-500 text-sm font-medium">Not yet assigned</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SLA Timer Card */}
                        <SlaTimerCard ticket={ticket} />
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} alt="Evidence" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
                    <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-800/80 text-white rounded-full flex items-center justify-center hover:bg-slate-700 cursor-pointer">✕</button>
                </div>
            )}

            {/* Assign Technician Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                            </div>
                            <h3 className="text-white text-xl font-bold">Assign Technician</h3>
                        </div>
                        {technicians.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-6 bg-slate-900/50 rounded-xl border border-slate-700/50">No technicians found in the system</p>
                        ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                                {technicians.map(tech => (
                                    <button
                                        key={tech.id}
                                        onClick={() => setSelectedTechId(tech.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center ${selectedTechId === tech.id
                                            ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                            : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 mr-4 flex items-center justify-center ${selectedTechId === tech.id ? 'border-amber-400' : 'border-slate-500'}`}>
                                            {selectedTechId === tech.id && <div className="w-2 h-2 rounded-full bg-amber-400"></div>}
                                        </div>
                                        <div>
                                            <p className="text-white text-[15px] font-semibold">{tech.name}</p>
                                            <p className="text-slate-400 text-sm mt-0.5">{tech.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-4">
                            <button onClick={() => setShowAssignModal(false)} className="flex-1 px-5 py-3 text-white bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm font-semibold transition-all cursor-pointer">Cancel</button>
                            <button onClick={handleAssign} disabled={!selectedTechId || actionLoading} className="flex-1 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all">
                        <div className="flex items-center gap-3 mb-6 text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            <h3 className="text-xl font-bold text-white">Reject Ticket</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">Please provide a reason for rejecting this ticket. This will be sent to the reporter.</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter detailed rejection reason..."
                            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none shadow-inner mb-6"
                            autoFocus
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setShowRejectModal(false)} className="flex-1 px-5 py-3 text-white bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm font-semibold transition-all cursor-pointer">Cancel</button>
                            <button onClick={handleReject} disabled={!rejectReason.trim() || actionLoading} className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 hover:shadow-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
            <span className="text-slate-400 text-sm">{label}</span>
            <span className="text-white text-sm font-medium">{value || '—'}</span>
        </div>
    );
}

function getSlaColor(ms) {
    if (ms == null) return 'text-slate-400';
    const hours = ms / 3600000;
    if (hours < 1) return 'text-emerald-400';
    if (hours < 4) return 'text-amber-400';
    return 'text-red-400';
}

function getSlaGlow(ms) {
    if (ms == null) return '';
    const hours = ms / 3600000;
    if (hours < 1) return 'shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    if (hours < 4) return 'shadow-[0_0_15px_rgba(245,158,11,0.15)]';
    return 'shadow-[0_0_15px_rgba(239,68,68,0.15)]';
}

function getSlaIconBg(ms) {
    if (ms == null) return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    const hours = ms / 3600000;
    if (hours < 1) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (hours < 4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function SlaTimerCard({ ticket }) {
    const liveFirstResponse = useLiveElapsed(ticket.createdAt, ticket.status === 'OPEN');
    const liveResolution = useLiveElapsed(ticket.createdAt, ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS');

    const firstResponseMs = ticket.slaFirstResponseMs ?? liveFirstResponse;
    const resolutionMs = ticket.slaResolutionMs ?? liveResolution;
    const firstResponseDone = ticket.slaFirstResponseMs != null;
    const resolutionDone = ticket.slaResolutionMs != null;

    return (
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>
            <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-3 relative z-10">
                <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </span>
                SLA Timers
            </h3>
            <div className="space-y-4 relative z-10">
                <div className={`bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 ${getSlaGlow(firstResponseMs)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] border ${getSlaIconBg(firstResponseMs)}`}>⚡</span>
                            First Response
                        </span>
                        {!firstResponseDone && ticket.status === 'OPEN' && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Live
                            </span>
                        )}
                        {firstResponseDone && <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">✓ Done</span>}
                    </div>
                    <p className={`text-xl font-black font-mono tracking-tight ${getSlaColor(firstResponseMs)}`}>
                        {firstResponseMs != null ? formatDuration(firstResponseMs) : '—'}
                    </p>
                    {firstResponseDone && ticket.firstResponseAt && (
                        <p className="text-slate-500 text-[11px] mt-1">at {new Date(ticket.firstResponseAt).toLocaleString()}</p>
                    )}
                </div>
                <div className={`bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 ${getSlaGlow(resolutionMs)}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] border ${getSlaIconBg(resolutionMs)}`}>🔧</span>
                            Resolution
                        </span>
                        {!resolutionDone && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                Live
                            </span>
                        )}
                        {resolutionDone && <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">✓ Done</span>}
                    </div>
                    <p className={`text-xl font-black font-mono tracking-tight ${getSlaColor(resolutionMs)}`}>
                        {resolutionMs != null ? formatDuration(resolutionMs) : '—'}
                    </p>
                    {resolutionDone && ticket.resolvedAt && (
                        <p className="text-slate-500 text-[11px] mt-1">at {new Date(ticket.resolvedAt).toLocaleString()}</p>
                    )}
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/30 relative z-10">
                <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> &lt;1h</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> 1-4h</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> &gt;4h</span>
                </div>
            </div>
        </div>
    );
}
