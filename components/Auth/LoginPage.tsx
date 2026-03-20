import React, { useState } from 'react';
import { Chrome } from 'lucide-react';
import { authHelpers } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';

interface LoginPageProps {
    onSuccess: () => void;
    onSwitchToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToSignup }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { executeRecaptcha } = useRecaptcha();

    React.useEffect(() => {
        document.title = 'Vadeo | Sign In';
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = await executeRecaptcha('LOGIN');
        if (!token) {
            setError('Verification failed. Please try again.');
            setLoading(false);
            return;
        }

        try {
            await authHelpers.signInWithGoogle('/editor');
        } catch (loginError: any) {
            setError(loginError?.message || 'Could not start Google sign-in.');
            setLoading(false);
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
                    <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-[10px] text-white">
                        Welcome Back
                    </h1>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                        Sign in with Google to continue to Vadeo
                    </p>
                </div>

                <form onSubmit={handleLogin}>
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
                            backgroundColor: loading ? '#555' : '#fff',
                            color: '#111',
                            border: '1px solid #3a3a3a',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <Chrome size={18} />
                        {loading ? 'Redirecting to Google...' : 'Continue with Google'}
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
                        Need an account?{' '}
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
                            Start with Google
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
