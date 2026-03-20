import React, { useState } from 'react';
import { authHelpers } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';

interface SignupPageProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
    redirectPath?: string;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSuccess, onSwitchToLogin, redirectPath = '/editor' }) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { executeRecaptcha } = useRecaptcha();

    React.useEffect(() => {
        document.title = 'Vadeo | Sign Up';
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = await executeRecaptcha('SIGNUP');
        if (!token) {
            setError('Verification failed. Please try again.');
            setLoading(false);
            return;
        }

        try {
            await authHelpers.signInWithGoogle(redirectPath);
        } catch (signupError: any) {
            console.error('Signup redirect error:', signupError);
            setError('Could not start Google sign-up.');
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#131313',
                backgroundImage:
                    'linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
            }}
        >
            <main
                style={{
                    minHeight: '100vh',
                    width: 'min(1200px, 100%)',
                    margin: '0 auto',
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                }}
            >
                <a
                    href="/"
                    style={{
                        color: 'rgba(255, 255, 255, 0.74)',
                        textDecoration: 'none',
                        fontSize: '14px',
                    }}
                >
                    ← Back to Home
                </a>

                <section
                    aria-label="Sign up"
                    style={{
                        width: 'min(480px, 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '36px 28px',
                        textAlign: 'center',
                    }}
                >
                    <img
                        src="/vadeo-logo-white.png"
                        alt="Vadeo"
                        style={{
                            width: '172px',
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block',
                            margin: '0 auto 18px',
                        }}
                    />
                    <h1
                        style={{
                            margin: '0 0 12px',
                            color: 'rgba(255, 255, 255, 0.94)',
                            fontSize: '36px',
                            fontWeight: 700,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        Create your account
                    </h1>
                    <p
                        style={{
                            margin: '0 0 22px',
                            color: 'rgba(255, 255, 255, 0.78)',
                            fontSize: '1rem',
                            lineHeight: 1.5,
                        }}
                    >
                        Sign up with Google to start creating with Vadeo.
                    </p>

                    {error ? (
                        <div
                            style={{
                                marginBottom: '16px',
                                borderRadius: '10px',
                                border: '1px solid rgba(239, 68, 68, 0.45)',
                                backgroundColor: 'rgba(127, 29, 29, 0.45)',
                                color: '#fff',
                                padding: '12px 14px',
                                fontSize: '14px',
                            }}
                        >
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleSignup}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                display: 'inline-flex',
                                width: '100%',
                                height: '46px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '6px',
                                color: 'rgba(255, 255, 255, 0.94)',
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '15px',
                                background: loading ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Redirecting to Google...' : 'Continue with Google'}
                        </button>
                    </form>

                    <div style={{ marginTop: '18px' }}>
                        <button
                            onClick={onSwitchToLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255, 255, 255, 0.74)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                textDecoration: 'underline',
                            }}
                        >
                            Already have an account? Sign in
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};
