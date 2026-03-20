import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authHelpers } from '../../lib/supabase';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useRecaptcha } from '../../hooks/useRecaptcha';

export const EmailVerificationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const { executeRecaptcha } = useRecaptcha();

    useEffect(() => {
        const checkSession = async () => {
            // Give Supabase a moment to process the hash fragment
            setTimeout(async () => {
                try {
                    const session = await authHelpers.getSession();

                    if (session) {
                        setIsAuthenticated(true);
                        setVerifying(false);
                    } else {
                        // Check if we have an error in the URL hash (Supabase puts it there)
                        const hash = window.location.hash;
                        if (hash && hash.includes('error_description')) {
                            const params = new URLSearchParams(hash.substring(1)); // remove #
                            const errorDescription = params.get('error_description');
                            setError(errorDescription || 'Verification failed');
                        } else {
                            // Verified but not logged in
                            setVerifying(false);
                        }
                    }
                } catch (err: any) {
                    console.error('Verification check error:', err);
                    setError(err.message || 'An error occurred during verification');
                }
            }, 1000);
        };

        checkSession();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        // Execute ReCaptcha
        const token = await executeRecaptcha('LOGIN');
        if (!token) {
            setLoginError('Verification failed. Please try again.');
            setLoginLoading(false);
            return;
        }

        const { data, error: authError } = await authHelpers.signIn(email, password);

        if (authError) {
            setLoginError(authError.message);
            setLoginLoading(false);
            return;
        }

        if (data.user) {
            navigate('/dashboard');
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
                maxWidth: '450px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                textAlign: 'center'
            }}>
                {verifying ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-6"></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Verification Issue</h2>
                        <p className="text-zinc-400 mb-8">{error}</p>
                        <button
                            onClick={() => navigate('/signin')}
                            className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>

                        {isAuthenticated ? (
                            <>
                                <p className="text-zinc-400 mb-8">
                                    Your account has been successfully verified. You can now access all features of BatchoCanvas.
                                </p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    Continue to Dashboard
                                    <ArrowRight size={18} />
                                </button>
                            </>
                        ) : (
                            <div className="w-full">
                                <p className="text-zinc-400 mb-6">
                                    Please sign in to continue to your dashboard.
                                </p>

                                <form onSubmit={handleLogin} className="text-left">
                                    <div style={{ marginBottom: '15px' }}>
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

                                    {loginError && (
                                        <div style={{
                                            backgroundColor: '#ff4444',
                                            color: '#fff',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            marginBottom: '20px',
                                            fontSize: '14px'
                                        }}>
                                            {loginError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loginLoading}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            backgroundColor: loginLoading ? '#555' : '#667eea',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            cursor: loginLoading ? 'not-allowed' : 'pointer',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {loginLoading ? 'Signing in...' : 'Sign In'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
