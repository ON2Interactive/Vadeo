import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { authHelpers } from '../../lib/supabase';

interface AdminLoginPageProps {
    onSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Admin credentials from environment variables
        const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
        const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            try {
                // Also attempt to sign in to Supabase to get RLS access
                const { error: authError } = await authHelpers.signIn(email, password);

                if (authError) {
                    // Try to sign up if potential user doesn't exist (optional auto-provisioning)
                    // For now, we'll just log it and proceed with local admin session
                    console.error('Supabase admin auth failed:', authError);
                }

                // Store admin session in localStorage
                localStorage.setItem('admin_authenticated', 'true');
                onSuccess();
            } catch (err) {
                console.error('Login error:', err);
                // Fallback to local only if network fails
                localStorage.setItem('admin_authenticated', 'true');
                onSuccess();
            }
        } else {
            setError('Invalid admin credentials');
        }

        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Grid Pattern Background */}
            <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

            {/* Blue Glow */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '384px', background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), transparent)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px', padding: '0 1.5rem' }}>
                <div style={{ backgroundColor: '#111', border: '1px solid #1a1a1a', borderRadius: '1rem', padding: '2.5rem' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: '#1e3a8a', borderRadius: '0.75rem' }}>
                                <Shield size={32} color="#60a5fa" />
                            </div>
                        </div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Admin Access</h1>
                        <p style={{ color: '#888', fontSize: '0.875rem' }}>Enter your admin credentials to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '0.5rem',
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                }}
                            />
                        </div>

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
                                backgroundColor: '#1e3a8a',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.5 : 1,
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
                        </button>
                    </form>

                    {/* Footer */}
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
