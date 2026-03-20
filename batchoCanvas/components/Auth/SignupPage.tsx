
import React, { useState } from 'react';
import { authHelpers, dbHelpers } from '../../lib/supabase';
import { useRecaptcha } from '../../hooks/useRecaptcha';
import { Mail } from 'lucide-react';

interface SignupPageProps {
    onSuccess: () => void;
    onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSuccess, onSwitchToLogin }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const { executeRecaptcha } = useRecaptcha();

    // Clear any existing session on mount to ensure clean signup
    React.useEffect(() => {
        const clearSession = async () => {
            const session = await authHelpers.getSession();
            if (session) {
                await authHelpers.signOut();
            }
        };
        clearSession();
    }, []);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        // Execute ReCaptcha
        const token = await executeRecaptcha('SIGNUP');
        if (!token) {
            setError('Verification failed. Please try again.');
            setLoading(false);
            return;
        }

        const { data, error: authError } = await authHelpers.signUp(email, password, fullName);

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            try {
                // Determine if we should show verification screen or auto-login (Dev vs Prod)
                // For now, we assume email verification is required if the user isn't confirmed immediately

                // If the session is missing, it means email confirmation is required (security setting)
                if (!data.session) {
                    setVerificationSent(true);

                    // Still send the admin notification
                    await dbHelpers.sendEmail({
                        to: email,
                        subject: 'New User Signup (Pending Verification)',
                        message: fullName,
                        type: 'signup'
                    }).catch(console.error);

                } else {
                    // Auto-confirmed (e.g. dev environment disabled confirm, or no SMTP enforced yet)
                    // Send Admin Notification
                    await dbHelpers.sendEmail({
                        to: email,
                        subject: 'New User Signup',
                        message: fullName,
                        type: 'signup'
                    }).catch(console.error);

                    onSuccess();
                }

            } catch (err: any) {
                console.error('Signup post-process error:', err);
                setError('A problem occurred while setting up your account. Please try logging in.');
            }
        }
        setLoading(false);
    };

    if (verificationSent) {
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
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Mail size={32} className="text-blue-400" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>

                    <p className="text-zinc-400 mb-6 leading-relaxed">
                        We've sent a verification link to <span className="text-white font-medium">{email}</span>.
                        <br />
                        Please check your inbox (and spam folder) to complete your registration.
                    </p>

                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-8 text-sm text-zinc-500">
                        <p>After clicking the link, you will be signed in automatically.</p>
                    </div>

                    <button
                        onClick={onSwitchToLogin}
                        className="w-full py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
                    >
                        Return to Sign In
                    </button>
                </div>
            </div>
        );
    }

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
                        Create Account
                    </h1>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                        Start creating amazing videos today
                    </p>
                </div>

                <form onSubmit={handleSignup}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
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
                            placeholder="John Doe"
                        />
                    </div>

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

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>

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
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                        Already have an account?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#667eea',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '14px'
                            }}
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                    <p style={{ color: '#4CAF50', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                        🎉 Get 50 free credits when you sign up!
                    </p>
                </div>
            </div>
        </div>
    );
};
