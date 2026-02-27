import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

/**
 * Admin User Management page — premium admin panel.
 *
 * Features:
 * - Role distribution overview with stat cards
 * - Searchable, filterable user table
 * - Inline role editing with visual feedback
 */
export default function AdminUsers({ standalone = false }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const roles = ['USER', 'ADMIN', 'TECHNICIAN', 'MANAGER'];

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

    // Filter users by search query
    const filteredUsers = users.filter((user) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            user.name?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q)
        );
    });

    // Role stats
    const roleCounts = {
        total: users.length,
        ADMIN: users.filter(u => u.role === 'ADMIN').length,
        MANAGER: users.filter(u => u.role === 'MANAGER').length,
        TECHNICIAN: users.filter(u => u.role === 'TECHNICIAN').length,
        USER: users.filter(u => u.role === 'USER').length,
    };

    const roleConfig = {
        USER: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '👤' },
        ADMIN: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '🛡️' },
        MANAGER: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '👔' },
        TECHNICIAN: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '🔧' },
    };

    return (
        <div className={standalone ? "" : "min-h-screen bg-slate-900"}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${standalone ? "py-0" : "py-8"}`}>

                {/* ── Header ───────────────────────────────────────── */}
                {!standalone && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">
                            User Management <span className="text-blue-400">Panel</span>
                        </h1>
                        <p className="text-slate-400 mt-1">
                            Manage user accounts, roles, and permissions across the campus.
                        </p>
                    </div>
                )}

                {/* ── Role Distribution Cards ──────────────────────── */}
                {!isLoading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {roles.map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${roleFilter === role
                                        ? 'bg-blue-600/20 border-blue-500/50 scale-[1.02]'
                                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xl">{roleConfig[role].icon}</span>
                                    <span className={`text-2xl font-bold ${roleFilter === role ? 'text-blue-400' : 'text-white'}`}>
                                        {roleCounts[role]}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-xs font-medium text-left">{role}S</p>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Search & Filter Bar ──────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* ── Users Table ──────────────────────────────────── */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700 rounded-2xl overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-400 text-sm">Loading users...</p>
                            </div>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-20">
                            <span className="text-4xl mb-4 block">🔍</span>
                            <p className="text-slate-400">{searchQuery ? 'No users match your search.' : 'No users found.'}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-800/80">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Provider</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {filteredUsers.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-slate-700/20 transition-colors"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            {/* User Info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={user.profilePicture}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full border-2 border-slate-600"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
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
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-700/80 text-slate-300 text-xs rounded-lg capitalize">
                                                    <span>🔗</span> {user.provider}
                                                </span>
                                            </td>

                                            {/* Role Selector */}
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        disabled={updatingUserId === user.id}
                                                        className={`px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer ${roleConfig[user.role]?.color}`}
                                                    >
                                                        {roles.map((role) => (
                                                            <option key={role} value={role} className="bg-slate-800 text-white">
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {updatingUserId === user.id && (
                                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Joined Date */}
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Footer Stats ─────────────────────────────────── */}
                {!isLoading && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-slate-500 text-sm">
                            Showing {filteredUsers.length} of {users.length} user{users.length !== 1 ? 's' : ''}
                        </p>
                        {roleFilter && (
                            <button
                                onClick={() => setRoleFilter('')}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
                            >
                                Clear filter ✕
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
