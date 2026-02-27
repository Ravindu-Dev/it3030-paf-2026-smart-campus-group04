import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTicketById, addComment, getComments, updateComment, deleteComment, updateTicketStatus, rejectTicket, assignTechnician, deleteTicket } from '../services/ticketService';
import { getTechnicians } from '../services/ticketService';
import toast from 'react-hot-toast';

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
            navigate('/tickets');
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
            navigate('/tickets');
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
        <div className="min-h-screen bg-slate-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Nav */}
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors mb-6 flex items-center gap-2 text-sm cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
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
                        {canAssign && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                            <button onClick={openAssignModal} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all cursor-pointer">
                                🔧 Assign
                            </button>
                        )}
                        {canUpdateStatus && ticket.status === 'IN_PROGRESS' && (
                            <button onClick={() => handleStatusUpdate('RESOLVED')} disabled={actionLoading} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-40">
                                ✅ Resolve
                            </button>
                        )}
                        {canUpdateStatus && ticket.status === 'RESOLVED' && (
                            <button onClick={() => handleStatusUpdate('CLOSED')} disabled={actionLoading} className="px-4 py-2 bg-slate-500/20 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-500/30 transition-all cursor-pointer disabled:opacity-40">
                                📁 Close
                            </button>
                        )}
                        {canReject && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                            <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all cursor-pointer">
                                ✕ Reject
                            </button>
                        )}
                        {isAdmin && (
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-all cursor-pointer">
                                🗑
                            </button>
                        )}
                    </div>
                </div>

                {/* Workflow Progress */}
                {ticket.status !== 'REJECTED' && (
                    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
                        <h3 className="text-sm font-medium text-slate-400 mb-4">Ticket Workflow</h3>
                        <div className="flex items-center justify-between">
                            {WORKFLOW_STEPS.map((step, i) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= currentStepIndex
                                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                : 'bg-slate-700 text-slate-500'
                                            }`}>
                                            {i < currentStepIndex ? '✓' : STATUS_CONFIG[step]?.icon}
                                        </div>
                                        <span className={`text-xs mt-2 ${i <= currentStepIndex ? 'text-amber-400 font-medium' : 'text-slate-500'}`}>
                                            {step.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {i < WORKFLOW_STEPS.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 mt-[-18px] ${i < currentStepIndex ? 'bg-amber-500' : 'bg-slate-700'}`} />
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-3">Description</h3>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                        </div>

                        {/* Evidence Images */}
                        {ticket.imageUrls?.length > 0 && (
                            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                                <h3 className="text-white font-semibold mb-3">Evidence ({ticket.imageUrls.length} images)</h3>
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
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
                                <h3 className="text-emerald-400 font-semibold mb-2">Resolution Notes</h3>
                                <p className="text-emerald-300/80 text-sm">{ticket.resolutionNotes}</p>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4">Comments ({comments.length})</h3>

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
                    <div className="space-y-4">
                        {/* Ticket Info */}
                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
                            <h3 className="text-white font-semibold mb-4">Details</h3>
                            <div className="space-y-3">
                                <InfoRow label="Ticket ID" value={ticket.id?.slice(-8)} />
                                <InfoRow label="Category" value={ticket.category?.replace('_', ' ')} />
                                <InfoRow label="Priority" value={ticket.priority} />
                                <InfoRow label="Facility" value={ticket.facilityName} />
                                <InfoRow label="Location" value={ticket.location} />
                                <InfoRow label="Created" value={new Date(ticket.createdAt).toLocaleString()} />
                                <InfoRow label="Updated" value={new Date(ticket.updatedAt).toLocaleString()} />
                            </div>
                        </div>

                        {/* Reporter */}
                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
                            <h3 className="text-white font-semibold mb-3">Reporter</h3>
                            <p className="text-slate-300 text-sm">{ticket.userName}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{ticket.userEmail}</p>
                            {ticket.contactPhone && (
                                <p className="text-slate-400 text-xs mt-0.5">📞 {ticket.contactPhone}</p>
                            )}
                        </div>

                        {/* Assigned Technician */}
                        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5">
                            <h3 className="text-white font-semibold mb-3">Assigned Technician</h3>
                            {ticket.assignedTechnicianName ? (
                                <div>
                                    <p className="text-amber-400 font-medium text-sm">{ticket.assignedTechnicianName}</p>
                                    <p className="text-slate-500 text-xs mt-1">Assigned by admin/manager</p>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">Not yet assigned</p>
                            )}
                        </div>
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white text-lg font-semibold mb-4">Assign Technician</h3>
                        {technicians.length === 0 ? (
                            <p className="text-slate-400 text-sm">No technicians found in the system</p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                                {technicians.map(tech => (
                                    <button
                                        key={tech.id}
                                        onClick={() => setSelectedTechId(tech.id)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedTechId === tech.id
                                                ? 'bg-amber-500/10 border-amber-500/50'
                                                : 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <p className="text-white text-sm font-medium">{tech.name}</p>
                                        <p className="text-slate-400 text-xs">{tech.email}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm cursor-pointer">Cancel</button>
                            <button onClick={handleAssign} disabled={!selectedTechId || actionLoading} className="px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-400 disabled:opacity-40 cursor-pointer">
                                {actionLoading ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-white text-lg font-semibold mb-4">Reject Ticket</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            className="w-full h-28 bg-slate-700/50 border border-slate-600/50 rounded-xl p-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500/50 resize-none"
                        />
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm cursor-pointer">Cancel</button>
                            <button onClick={handleReject} disabled={!rejectReason.trim() || actionLoading} className="px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-400 disabled:opacity-40 cursor-pointer">
                                {actionLoading ? 'Rejecting...' : 'Reject Ticket'}
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
