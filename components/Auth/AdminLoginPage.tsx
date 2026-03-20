import React, { useState } from 'react';
import { Shield, Chrome } from 'lucide-react';
import { authHelpers } from '../../lib/supabase';

interface AdminLoginPageProps {
    onSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authHelpers.signInWithGoogle('/admin');
        } catch (err) {
            console.error('Admin login error:', err);
            setError('Could not start Google admin sign-in.');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '384px', background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), transparent)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', padding: '0 1.5rem' }}>
                <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#1e3a8a', borderRadius: '0.75rem' }}>
                                <Shield size={32} color="#60a5fa" />
                            </div>
                        </div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Admin Access</h1>
                        <p style={{ color: '#888', fontSize: '0.875rem' }}>Continue with a Google account that is listed as an admin.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#7f1d1d', border: '1px solid #991b1b', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                                <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: '#fff',
                                color: '#111',
                                border: '1px solid #333',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <Chrome size={16} />
                            {loading ? 'Redirecting...' : 'Continue with Google'}
                        </button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <a href="/" style={{ color: '#888', fontSize: '0.875rem', textDecoration: 'none' }}>
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
