import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * User Profile page.
 *
 * Displays the logged-in user's info (name, email, picture, role).
 * Allows updating name and deleting account.
 */
export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState(user?.name || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty.');
            return;
        }

        setIsUpdating(true);
        try {
            await api.put('/auth/profile', { name: name.trim() });
            toast.success('Profile updated successfully!');
            // Refresh the page to get updated user data
            window.location.reload();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile.';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete('/auth/account');
            toast.success('Account deleted successfully.');
            logout();
            navigate('/login', { replace: true });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete account.';
            toast.error(message);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

                {/* Profile Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 mb-6">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-6 mb-8">
                        {user?.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-20 h-20 rounded-full border-4 border-blue-500/30"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
                            <p className="text-slate-400">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-600/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    {/* Update Name Form */}
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter your name"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors cursor-pointer"
                        >
                            {isUpdating ? 'Updating...' : 'Update Profile'}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-red-900/50 rounded-2xl p-8">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/50 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
