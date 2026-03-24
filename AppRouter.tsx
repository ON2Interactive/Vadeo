import React, { useState, useEffect } from 'react';
import { authHelpers, dbHelpers, type TrialState } from './lib/supabase';
import { LoginPage } from './components/Auth/LoginPage';
import { SignupPage } from './components/Auth/SignupPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { EmailVerificationPage } from './components/Auth/EmailVerificationPage';
import App from './App';
import NewLandingPage from './NewLandingPage';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginPage } from './components/Auth/AdminLoginPage';
import { adminHelpers } from './lib/supabase';
import { type StripePlanId } from './stripeConfig';
import { beginStripeCheckout } from './lib/stripeCheckout';
import GoogleOAuthCallbackPage from './components/Auth/GoogleOAuthCallbackPage';
import { getStoredPlanForUser, hasStoredSubscription, setStoredPlanForUser } from './lib/subscriptionStorage';

import { useLocation, useNavigate } from 'react-router-dom';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import UseCasesPage from './components/UseCasesPage';
import PricingPage from './components/PricingPage';
import FAQPage from './components/FAQPage';
import HelpPage from './components/HelpPage';
import GuidesPage from './components/GuidesPage';

import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import CookiePage from './components/CookiePage';
import DMCAPage from './components/DMCAPage';

type View = 'landing' | 'login' | 'signup' | 'verifyEmail' | 'dashboard' | 'editor' | 'admin' | 'adminLogin' | 'contact' | 'about' | 'useCases' | 'pricing' | 'faq' | 'help' | 'guides' | 'terms' | 'privacy' | 'cookie' | 'dmca' | 'googleCallback';

const AppRouter: React.FC = () => {
    const [view, setView] = useState<View>('landing');
    const [loading, setLoading] = useState(true);
    const [currentProject, setCurrentProject] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [trialState, setTrialState] = useState<TrialState>({ status: 'none', startedAt: null, expiresAt: null });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const initializeRouter = async () => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('payment') === 'success') {
                const pendingPurchase = localStorage.getItem('pending_purchase');
                if (pendingPurchase) {
                    try {
                        const purchaseData = JSON.parse(pendingPurchase);
                        const purchasedPlanId = purchaseData.planId;
                        let resolvedPlan: 'starter' | 'standard' | 'premium' | null = null;
                        if (purchasedPlanId === 'STARTER') {
                            resolvedPlan = 'starter';
                        } else if (purchasedPlanId === 'PRO') {
                            resolvedPlan = 'standard';
                        } else if (purchasedPlanId === 'BRAND') {
                            resolvedPlan = 'premium';
                        }

                        const user = await authHelpers.getCurrentUser();
                        if (user) {
                            if (resolvedPlan) {
                                setStoredPlanForUser(user.id, resolvedPlan);
                                await dbHelpers.updateSubscription({
                                    plan: resolvedPlan,
                                    status: 'active',
                                });
                                setHasSubscription(true);
                            }

                            dbHelpers.sendEmail({
                                to: user.email || 'unknown@user.com',
                                subject: 'New Purchase',
                                message: JSON.stringify(purchaseData),
                                type: 'purchase'
                            }).then(() => {
                                console.log('Purchase notification sent');
                                localStorage.removeItem('pending_purchase');
                            }).catch(err => console.error('Failed to send purchase notification:', err));
                        }
                    } catch (e) {
                        console.error('Error parsing pending purchase:', e);
                    }
                }
                navigate('/editor', { replace: true });
                return;
            }

            checkAuth();
        };

        initializeRouter();
    }, [isAdminAuthenticated, navigate]);

    useEffect(() => {
        // Sync view with URL path
        const path = location.pathname;
        console.log('AppRouter: path changed to', path); // DEBUG
        if (path === '/dashboard') {
            navigate('/editor', { replace: true });
            return;
        }
        if (path === '/contact') {
            setView('contact');
        } else if (path === '/about') {
            setView('about');
        } else if (path === '/use-cases') {
            console.log('AppRouter: Setting view to useCases'); // DEBUG
            setView('useCases');
        } else if (path === '/pricing') {
            setView('pricing');
        } else if (path === '/faq') {
            setView('faq');
        } else if (path === '/help') {
            setView('help');
        } else if (path === '/guides') {
            setView('guides');
        } else if (path === '/terms') {
            setView('terms');
        } else if (path === '/privacy') {
            setView('privacy');
        } else if (path === '/cookie') {
            setView('cookie');
        } else if (path === '/dmca') {
            setView('dmca');
        } else if (path === '/') {
            setView('landing');
        } else if (path === '/dashboard') {
            setView('dashboard');
        } else if (path.startsWith('/editor')) {
            setView('editor');
        } else if (path === '/signin') {
            setView('login');
        } else if (path === '/signup') {
            setView('signup');
        } else if (path === '/verify-email') {
            setView('verifyEmail');
        } else if (path === '/auth/google/callback') {
            setView('googleCallback');
        } else if (path === '/admin') {
            setView('admin');
        } else if (path === '/admin-login') {
            setView('adminLogin');
        }
    }, [location.pathname]);

    const checkAuth = async () => {
        const session = await authHelpers.getSession();
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const wantsTrial = params.get('trial') === '1';

        if (path === '/dashboard') {
            navigate('/editor', { replace: true });
            setLoading(false);
            return;
        }

        if (session) {
            setIsAuthenticated(true);
            const adminStatus = await adminHelpers.isUserAdmin(session.user.id);
            const accessState = await dbHelpers.getAccessState().catch(() => null);
            const fallbackPlan = getStoredPlanForUser(session.user.id);
            const userPlan = accessState?.subscription?.plan || fallbackPlan || null;
            const userHasSubscription = accessState ? Boolean(userPlan) : hasStoredSubscription(session.user.id);
            let nextTrialState = accessState?.trial || (await dbHelpers.getTrialState(session.user.id)).data;

            if (wantsTrial && !adminStatus && !userHasSubscription && nextTrialState.status === 'none') {
                const startedTrial = await dbHelpers.startFreeTrial(session.user.id);
                if (startedTrial.data) {
                    nextTrialState = startedTrial.data;
                }
            }

            const canAccessEditor = adminStatus || userHasSubscription || nextTrialState.status === 'active' || nextTrialState.status === 'expired';
            setHasSubscription(userHasSubscription);
            setTrialState(nextTrialState);
            setIsAdmin(adminStatus);
            setIsAdminAuthenticated(adminStatus);

            // Allow public pages even if logged in
            if (path === '/contact') {
                setView('contact');
            } else if (path === '/about') {
                setView('about');
            } else if (path === '/use-cases') {
                setView('useCases');
            } else if (path === '/pricing') {
                setView('pricing');
            } else if (path === '/faq') {
                setView('faq');
            } else if (path === '/help') {
                setView('help');
            } else if (path === '/guides') {
                setView('guides');
            } else if (path === '/terms') {
                setView('terms');
            } else if (path === '/privacy') {
                setView('privacy');
            } else if (path === '/cookie') {
                setView('cookie');
            } else if (path === '/dmca') {
                setView('dmca');
            } else if (path === '/') {
                setView('landing');
            } else if (path === '/auth/google/callback') {
                setView('googleCallback');
            } else if (path.startsWith('/editor')) {
                if (canAccessEditor) {
                    setView('editor');
                } else {
                    navigate('/pricing', { replace: true });
                }
            } else if (path === '/admin') {
                setView('admin');
            } else if (path === '/admin-login') {
                setView('adminLogin');
            } else {
                // Default for unknown authenticated routes? 
                // Maybe check if it matches other public routes
                if (path === '/signin' || path === '/signup') {
                    navigate(canAccessEditor ? '/editor' : wantsTrial ? '/signup?trial=1' : '/pricing', { replace: true });
                } else {
                    setView('landing'); // Default to landing for unknown
                }
            }
        } else {
            setIsAuthenticated(false);
            setHasSubscription(false);
            setTrialState({ status: 'none', startedAt: null, expiresAt: null });
            if (path === '/admin') {
                setView('admin');
            } else if (path === '/admin-login') {
                setView('adminLogin');
            } else if (path === '/contact') {
                setView('contact');
            } else if (path === '/about') {
                setView('about');
            } else if (path === '/use-cases') {
                setView('useCases');
            } else if (path === '/pricing') {
                setView('pricing');
            } else if (path === '/faq') {
                setView('faq');
            } else if (path === '/help') {
                setView('help');
            } else if (path === '/guides') {
                setView('guides');
            } else if (path === '/terms') {
                setView('terms');
            } else if (path === '/privacy') {
                setView('privacy');
            } else if (path === '/cookie') {
                setView('cookie');
            } else if (path === '/dmca') {
                setView('dmca');
            } else if (path === '/signin') {
                setView('login');
            } else if (path === '/signup') {
                setView('signup');
            } else if (path === '/verify-email') {
                setView('verifyEmail');
            } else if (path === '/auth/google/callback') {
                setView('googleCallback');
            } else if (path.startsWith('/editor')) {
                navigate(wantsTrial ? '/signup?trial=1' : '/signup', { replace: true });
            } else {
                setView('landing');
            }
        }
        setLoading(false);
    };

    const handleAdminLoginSuccess = () => {
        navigate('/admin');
    };

    const handleAdminLogout = () => {
        setIsAdminAuthenticated(false);
        navigate('/admin-login');
    };

    const handleLoginSuccess = () => {
        navigate(isAdmin || hasSubscription || trialState.status !== 'none' ? '/editor' : '/pricing');
    };

    const handleSignupSuccess = () => {
        navigate('/pricing');
    };

    const handleLogout = () => {
        navigate('/signin');
        setCurrentProject(null);
    };

    const handleNewProject = () => {
        setCurrentProject(null);
        navigate('/editor');
    };

    const handleLoadProject = (project: any) => {
        setCurrentProject(project);
        navigate(`/editor/${project.id}`);
    };

    const handleBackToDashboard = () => {
        navigate('/');
        setCurrentProject(null);
    };

    const handleBuyCredits = async (planId: StripePlanId) => {
        const session = await authHelpers.getSession();
        if (session) {
            await beginStripeCheckout(planId, {
                successPath: '/editor',
                cancelPath: location.pathname.startsWith('/editor') ? '/editor' : '/pricing',
            });
        } else {
            // User not logged in, go to signup first
            navigate('/signup');
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0a0a0a',
                color: '#fff'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (view === 'contact') {
        return <ContactPage />;
    }

    if (view === 'about') {
        return <AboutPage />;
    }

    if (view === 'useCases') {
        return (
            <UseCasesPage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'pricing') {
        return (
            <PricingPage
                onBuyCredits={handleBuyCredits}
            />
        );
    }

    if (view === 'faq') {
        return (
            <FAQPage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'help') {
        return (
            <HelpPage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'guides') {
        return (
            <GuidesPage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'terms') {
        return (
            <TermsPage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'privacy') {
        return (
            <PrivacyPage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'cookie') {
        return (
            <CookiePage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'dmca') {
        return (
            <DMCAPage
                onStartEditing={() => setView('signup')}
            />
        );
    }

    if (view === 'landing') {
        return (
            <NewLandingPage
                onStartEditing={() => navigate('/signup?trial=1')}
                onBuyCredits={handleBuyCredits}
            />
        );
    }

    if (view === 'login') {
        return (
            <LoginPage
                onSuccess={handleLoginSuccess}
                onSwitchToSignup={() => navigate(location.search ? `/signup${location.search}` : '/signup')}
                redirectPath={location.search.includes('trial=1') ? '/editor?trial=1' : '/editor'}
            />
        );
    }

    if (view === 'signup') {
        return (
            <SignupPage
                onSuccess={handleSignupSuccess}
                onSwitchToLogin={() => navigate(location.search ? `/signin${location.search}` : '/signin')}
                redirectPath={location.search.includes('trial=1') ? '/editor?trial=1' : '/pricing'}
            />
        );
    }

    if (view === 'verifyEmail') {
        return <EmailVerificationPage />;
    }

    if (view === 'googleCallback') {
        return <GoogleOAuthCallbackPage />;
    }

    if (view === 'adminLogin') {
        return (
            <AdminLoginPage onSuccess={handleAdminLoginSuccess} />
        );
    }

    if (view === 'admin') {
        if (!isAdminAuthenticated || !isAdmin) {
            setView('adminLogin');
            return null;
        }
        return (
            <AdminDashboard onLogout={handleAdminLogout} />
        );
    }

    if (view === 'editor') {
        return (
            <App
                initialProject={currentProject}
                onBackToDashboard={handleBackToDashboard}
                trialState={trialState}
            />
        );
    }

    return null;
};

export default AppRouter;
