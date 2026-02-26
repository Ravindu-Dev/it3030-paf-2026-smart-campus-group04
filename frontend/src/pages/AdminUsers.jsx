import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Admin User Management page.
 *
 * ADMIN-only page that displays all users in a table.
 * Features:
 * - Filter users by role
 * - Change a user's role via dropdown
 */
export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const roles = ['USER', 'ADMIN', 'TECHNICIAN', 'MANAGER'];

    // Fetch users on mount and when filter changes
    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = roleFilter ? { role: roleFilter } : {};
            const response = await api.get('/users', { params });
            setUsers(response.data.data);
        } catch (error) {
            toast.error('Failed to load users.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingUserId(userId);
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            toast.success('User role updated successfully!');
            // Update the local state instead of refetching
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update role.';
            toast.error(message);
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">User Management</h1>
                        <p className="text-slate-400 mt-1">Manage roles and permissions for all users.</p>
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* Users Table */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-400 text-sm">Loading users...</p>
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-slate-400">No users found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Provider</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={user.profilePicture}
                                                            alt={user.name}
                                                            className="w-9 h-9 rounded-full"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                    )}
                                                    <span className="text-white text-sm font-medium">{user.name}</span>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-6 py-4 text-slate-400 text-sm">{user.email}</td>

                                            {/* Provider */}
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md capitalize">
                                                    {user.provider}
                                                </span>
                                            </td>

                                            {/* Role Selector */}
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={updatingUserId === user.id}
                                                    className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {roles.map((role) => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Joined Date */}
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString()
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* User Count */}
                {!isLoading && (
                    <p className="text-slate-500 text-sm mt-4">
                        {users.length} user{users.length !== 1 ? 's' : ''} total
                    </p>
                )}
            </div>
        </div>
    );
}
