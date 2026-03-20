import React, { useEffect, useState } from 'react';
import { authHelpers, dbHelpers } from '../../lib/supabase';
import { PlusCircle, LogOut, CreditCard } from 'lucide-react';

interface DashboardProps {
    onNewProject: () => void;
    onLoadProject: (projectData: any) => void;
    onLogout: () => void;
    onAdminClick?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNewProject, onLoadProject, onLogout, onAdminClick }) => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        const currentUser = await authHelpers.getCurrentUser();
        if (!currentUser) {
            onLogout();
            return;
        }

        setUser(currentUser);

        const { data: profileData } = await dbHelpers.getUserProfile(currentUser.id);
        setProfile(profileData);

        const { data: projectsData } = await dbHelpers.getUserProjects(currentUser.id);
        setProjects(projectsData || []);

        setLoading(false);
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        await dbHelpers.deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
    };

    const handleLogout = async () => {
        await authHelpers.signOut();
        onLogout();
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a'
            }}>
                <div style={{ color: '#fff', fontSize: '18px' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff' }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #2a2a2a',
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ height: '20px', marginBottom: '8px' }}>
                        <img src="/batchoCanvas-Logo-White.svg" alt="batchoCanvas" style={{ height: '100%' }} />
                    </div>
                    <p style={{ color: '#888', fontSize: '14px', margin: '5px 0 0 0' }}>
                        Welcome back, {profile?.full_name || user?.email}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        backgroundColor: '#2a2a2a',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <CreditCard size={20} color="#667eea" />
                        <span style={{ fontWeight: 'bold' }}>{profile?.credits || 0} Credits</span>
                    </div>
                    {onAdminClick && (
                        <button
                            onClick={onAdminClick}
                            style={{
                                backgroundColor: '#1e3a8a',
                                color: '#fff',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            Admin
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: '#2a2a2a',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '40px' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Your Projects</h2>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                        Create and manage your video projects
                    </p>
                </div>

                {/* Projects Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {/* New Project Card */}
                    <div
                        onClick={onNewProject}
                        style={{
                            backgroundColor: '#1a1a1a',
                            border: '2px dashed #3a3a3a',
                            borderRadius: '12px',
                            padding: '40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            minHeight: '200px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.backgroundColor = '#2a2a2a';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#3a3a3a';
                            e.currentTarget.style.backgroundColor = '#1a1a1a';
                        }}
                    >
                        <PlusCircle size={48} color="#667eea" style={{ marginBottom: '15px' }} />
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>New Project</span>
                        <span style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>
                            Start creating
                        </span>
                    </div>

                    {/* Existing Projects */}
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            style={{
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #2a2a2a',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#2a2a2a';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Thumbnail */}
                            <div
                                onClick={() => onLoadProject(project)}
                                style={{
                                    backgroundColor: '#2a2a2a',
                                    height: '150px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundImage: project.thumbnail ? `url(${project.thumbnail})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {!project.thumbnail && (
                                    <span style={{ color: '#666', fontSize: '48px' }}>🎬</span>
                                )}
                            </div>

                            {/* Project Info */}
                            <div style={{ padding: '15px' }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>{project.name}</h3>
                                <p style={{ color: '#888', fontSize: '12px', marginBottom: '15px' }}>
                                    Updated {new Date(project.updated_at).toLocaleDateString()}
                                </p>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => onLoadProject(project)}
                                        style={{
                                            flex: 1,
                                            backgroundColor: '#667eea',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Open
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteProject(project.id);
                                        }}
                                        style={{
                                            backgroundColor: '#2a2a2a',
                                            color: '#ff4444',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#666'
                    }}>
                        <p style={{ fontSize: '18px', marginBottom: '10px' }}>No projects yet</p>
                        <p style={{ fontSize: '14px' }}>Click "New Project" to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
