import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../../lib/supabase';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const session = await authHelpers.getSession();
                if (session) {
                    setIsAuthenticated(true);
                }
                setVerifying(false);
            } catch (err: any) {
                console.error('Verification check error:', err);
                setError(err.message || 'An error occurred while loading your session');
                setVerifying(false);
            }
        };

        checkSession();
    }, []);

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
                        <h2 className="text-2xl font-bold text-white mb-4">Session Issue</h2>
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
                                    Your account has been successfully verified. You can now access all features of Vadeo.
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
                                    You are not signed in yet. Continue with Google to reach your dashboard.
                                </p>
                                <button
                                    onClick={() => navigate('/signin')}
                                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Go to Sign In
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
