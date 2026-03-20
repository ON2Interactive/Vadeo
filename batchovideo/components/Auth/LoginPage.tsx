import React, { useState } from 'react';
import { authHelpers } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';

interface LoginPageProps {
    onSuccess: () => void;
    onSwitchToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { executeRecaptcha } = useRecaptcha();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Execute ReCaptcha
        const token = await executeRecaptcha('LOGIN');
        if (!token) {
            setError('Verification failed. Please try again.');
            setLoading(false);
            return;
        }

        const { data, error: authError } = await authHelpers.signIn(email, password);

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            onSuccess();
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                padding: '40px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '10px' }}>
                        Welcome Back
                    </h1>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                        Sign in to continue to BatchoVideo
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #3a3a3a',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #3a3a3a',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#ff4444',
                            color: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: loading ? '#555' : '#667eea',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{
                    color: '#666',
                    fontSize: '11px',
                    marginTop: '15px',
                    textAlign: 'center',
                    lineHeight: '1.4'
                }}>
                    This site is protected by reCAPTCHA and the Google
                    <a href="https://policies.google.com/privacy" style={{ color: '#888', textDecoration: 'underline', margin: '0 4px' }}>Privacy Policy</a> and
                    <a href="https://policies.google.com/terms" style={{ color: '#888', textDecoration: 'underline', margin: '0 4px' }}>Terms of Service</a> apply.
                </p>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                        Don't have an account?{' '}
                        <button
                            onClick={onSwitchToSignup}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#667eea',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '14px'
                            }}
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
