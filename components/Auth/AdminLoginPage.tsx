import React, { useState } from 'react';
import { adminHelpers } from '../../lib/supabase';

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

        try {
            const { error: loginError } = await adminHelpers.login(email, password);
            if (loginError) {
                setError(loginError instanceof Error ? loginError.message : 'Could not sign in.');
                setLoading(false);
                return;
            }
            onSuccess();
        } catch (err) {
            setError('Could not sign in.');
            setLoading(false);
        }
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '32px',
            background: 'radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 28%), linear-gradient(180deg, #090909 0%, #020202 100%)',
            color: '#fff',
            fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
            <section style={{
                width: 'min(100%, 420px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '28px',
                background: 'rgba(0,0,0,0.68)',
                backdropFilter: 'blur(24px)',
                padding: '32px',
                boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
            }}>
                <a href="/" aria-label="Vadeo home" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '28px', color: '#fff', textDecoration: 'none' }}>
                    <img src="/vadeo-logo-white.png" alt="Vadeo" style={{ width: 138, display: 'block' }} />
                </a>
                <h1 style={{ margin: '0 0 8px', fontSize: '30px', letterSpacing: '-0.03em' }}>Admin Login</h1>
                <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.65 }}>
                    Private entry for Vadeo account administration. This page is not linked publicly.
                </p>

                <form onSubmit={handleLogin} style={{ display: 'grid', gap: '14px' }}>
                    <input
                        type="email"
                        placeholder="Admin email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        style={{
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        style={{
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.04)',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                        }}
                    />
                    {error && (
                        <p style={{
                            margin: 0,
                            border: '1px solid rgba(248,113,113,0.28)',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            color: '#fca5a5',
                            background: 'rgba(127,29,29,0.2)',
                            fontSize: '13px',
                        }}>
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: '14px',
                            background: '#fff',
                            color: '#0a0a0a',
                            padding: '14px 18px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                        }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '18px', color: 'rgba(255,255,255,0.22)', fontSize: '12px' }}>
                    Use the admin credentials configured in Vercel with <code>ADMIN_LOGIN_EMAIL</code> and <code>ADMIN_LOGIN_PASSWORD</code>.
                </div>
            </section>
        </main>
    );
};
