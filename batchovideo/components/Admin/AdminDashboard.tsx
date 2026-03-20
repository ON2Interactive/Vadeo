import React, { useState, useEffect } from 'react';
import { adminHelpers, authHelpers } from '../../lib/supabase';
import { Users, DollarSign, UserPlus, Edit2, Trash2, Shield } from 'lucide-react';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    credits: number;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

interface UserStats {
    totalUsers: number;
    totalCredits: number;
    joinsToday: number;
}

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editCredits, setEditCredits] = useState<number>(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [usersResult, statsResult] = await Promise.all([
            adminHelpers.getAllUsers(),
            adminHelpers.getUserStats(),
        ]);

        if (usersResult.data) setUsers(usersResult.data);
        if (statsResult.data) setStats(statsResult.data);
        setLoading(false);
    };

    const handleUpdateCredits = async (userId: string) => {
        await adminHelpers.updateUserCredits(userId, editCredits);
        setEditingUserId(null);
        loadData();
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await adminHelpers.deleteUser(userId);
            loadData();
        }
    };

    const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
        await adminHelpers.toggleAdminStatus(userId, !currentStatus);
        loadData();
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: '#fff' }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid #1a1a1a', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ height: '32px' }}>
                        <img src="/batchoVideo.svg" alt="batchoVideo" style={{ height: '100%' }} />
                    </div>
                    <span style={{ color: '#666', fontSize: '0.875rem' }}>Admin Dashboard</span>
                </div>
                <button
                    onClick={onLogout}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '0.375rem', cursor: 'pointer' }}
                >
                    Logout
                </button>
            </div>

            <div style={{ padding: '2rem' }}>
                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '0.5rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ padding: '0.5rem', backgroundColor: '#1e3a8a', borderRadius: '0.375rem' }}>
                                <Users size={20} color="#60a5fa" />
                            </div>
                            <span style={{ color: '#888', fontSize: '0.875rem' }}>Total Users</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalUsers || 0}</div>
                    </div>

                    <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '0.5rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ padding: '0.5rem', backgroundColor: '#854d0e', borderRadius: '0.375rem' }}>
                                <DollarSign size={20} color="#fbbf24" />
                            </div>
                            <span style={{ color: '#888', fontSize: '0.875rem' }}>Total Credits</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{stats?.totalCredits || 0}</div>
                    </div>

                    <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '0.5rem', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div style={{ padding: '0.5rem', backgroundColor: '#065f46', borderRadius: '0.375rem' }}>
                                <UserPlus size={20} color="#34d399" />
                            </div>
                            <span style={{ color: '#888', fontSize: '0.875rem' }}>Joins Today</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.joinsToday || 0}</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#111',
                            border: '1px solid #1a1a1a',
                            borderRadius: '0.375rem',
                            color: '#fff',
                            fontSize: '0.875rem',
                        }}
                    />
                </div>

                {/* Users Table */}
                <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #1a1a1a', backgroundColor: '#0a0a0a' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>User</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>Email</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>Credits</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>Joined</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                                                {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{user.full_name || 'No name'}</div>
                                                {user.is_admin && (
                                                    <span style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Shield size={12} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#888' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {editingUserId === user.id ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={editCredits}
                                                    onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                                                    style={{ width: '5rem', padding: '0.25rem 0.5rem', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '0.25rem', color: '#fff' }}
                                                />
                                                <button
                                                    onClick={() => handleUpdateCredits(user.id)}
                                                    style={{ padding: '0.25rem 0.5rem', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingUserId(null)}
                                                    style={{ padding: '0.25rem 0.5rem', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#fbbf24', fontWeight: '600' }}>{user.credits}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#888', fontSize: '0.875rem' }}>{formatDate(user.created_at)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    setEditingUserId(user.id);
                                                    setEditCredits(user.credits);
                                                }}
                                                style={{ padding: '0.5rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Edit credits"
                                            >
                                                <Edit2 size={16} color="#888" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                                                style={{ padding: '0.5rem', backgroundColor: user.is_admin ? '#1e3a8a' : '#1a1a1a', border: '1px solid #333', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title={user.is_admin ? 'Remove admin' : 'Make admin'}
                                            >
                                                <Shield size={16} color={user.is_admin ? '#60a5fa' : '#888'} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                style={{ padding: '0.5rem', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Delete user"
                                            >
                                                <Trash2 size={16} color="#ef4444" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
