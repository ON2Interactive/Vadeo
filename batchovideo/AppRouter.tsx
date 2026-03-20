import React, { useState, useEffect } from 'react';
import { authHelpers } from './lib/supabase';
import { LoginPage } from './components/Auth/LoginPage';
import { SignupPage } from './components/Auth/SignupPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import App from './App';
import NewLandingPage from './NewLandingPage';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginPage } from './components/Auth/AdminLoginPage';
import { adminHelpers } from './lib/supabase';
import { STRIPE_CONFIG } from './stripeConfig';

import { useLocation } from 'react-router-dom';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'editor' | 'admin' | 'adminLogin' | 'contact' | 'about';

const AppRouter: React.FC = () => {
    const [view, setView] = useState<View>('landing');
    const [loading, setLoading] = useState(true);
    const [currentProject, setCurrentProject] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [pendingPlan, setPendingPlan] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        checkAuth();
        checkAdminAuth();

        // Check for payment success
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success') {
            window.history.replaceState({}, '', '/editor');
            setView('editor');
        }
    }, [isAdminAuthenticated]);

    useEffect(() => {
        // Sync view with URL path
        const path = location.pathname;
        if (path === '/contact') {
            setView('contact');
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
        } else if (path === '/admin') {
            setView('adminLogin');
        } else if (path === '/about') {
            setView('about');
        }
    }, [location.pathname]);

    const checkAuth = async () => {
        const session = await authHelpers.getSession();
        const path = window.location.pathname;

        if (session) {
            const adminStatus = await adminHelpers.isUserAdmin(session.user.id);
            setIsAdmin(adminStatus);

            // Allow public pages even if logged in
            if (path === '/contact') {
                setView('contact');
            } else if (path === '/about') {
                setView('about');
            } else if (path === '/') {
                setView('landing');
            } else if (path === '/dashboard') {
                setView('dashboard');
            } else if (path.startsWith('/editor')) {
                setView('editor');
            } else {
                // Default for unknown authenticated routes? 
                // Maybe check if it matches other public routes
                if (path === '/signin' || path === '/signup') {
                    setView('dashboard'); // Redirect auth pages to dashboard
                } else {
                    setView('landing'); // Default to landing for unknown
                }
            }
        } else {
            if (path === '/admin') {
                setView('adminLogin');
            } else if (path === '/contact') {
                setView('contact');
            } else if (path === '/about') {
                setView('about');
            } else if (path === '/signin') {
                setView('login');
            } else if (path === '/signup') {
                setView('signup');
            } else if (path === '/dashboard') {
                setView('login'); // Protect dashboard
            } else {
                setView('landing');
            }
        }
        setLoading(false);
    };

    const checkAdminAuth = () => {
        const adminAuth = localStorage.getItem('admin_authenticated');
        if (adminAuth === 'true') {
            setIsAdminAuthenticated(true);
        }
    };

    const handleAdminLoginSuccess = () => {
        setIsAdminAuthenticated(true);
        window.history.pushState({}, '', '/admin');
        setView('admin');
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('admin_authenticated');
        setIsAdminAuthenticated(false);
        window.history.pushState({}, '', '/');
        setView('adminLogin');
    };

    const handleLoginSuccess = () => {
        window.history.pushState({}, '', '/dashboard');
        setView('dashboard');
    };

    const handleSignupSuccess = () => {
        if (pendingPlan && STRIPE_CONFIG.LINKS[pendingPlan as keyof typeof STRIPE_CONFIG.LINKS]) {
            // Redirect to Stripe if there was a pending plan
            window.location.href = STRIPE_CONFIG.LINKS[pendingPlan as keyof typeof STRIPE_CONFIG.LINKS];
        } else {
            window.history.pushState({}, '', '/dashboard');
            setView('dashboard');
        }
        setPendingPlan(null);
    };

    const handleLogout = () => {
        window.history.pushState({}, '', '/signin');
        setView('login');
        setCurrentProject(null);
    };

    const handleNewProject = () => {
        setCurrentProject(null);
        window.history.pushState({}, '', '/editor');
        setView('editor');
    };

    const handleLoadProject = (project: any) => {
        setCurrentProject(project);
        window.history.pushState({}, '', `/editor/${project.id}`);
        setView('editor');
    };

    const handleBackToDashboard = () => {
        window.history.pushState({}, '', '/dashboard');
        setView('dashboard');
        setCurrentProject(null);
    };

    const handleBuyCredits = async (planId: string) => {
        const session = await authHelpers.getSession();
        if (session) {
            // User is logged in, go straight to Stripe
            if (STRIPE_CONFIG.LINKS[planId as keyof typeof STRIPE_CONFIG.LINKS]) {
                window.location.href = STRIPE_CONFIG.LINKS[planId as keyof typeof STRIPE_CONFIG.LINKS];
            }
        } else {
            // User not logged in, go to signup first
            setPendingPlan(planId);
            window.history.pushState({}, '', '/signup');
            setView('signup');
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

    if (view === 'landing') {
        return (
            <NewLandingPage
                onStartEditing={() => setView('signup')}
                onBuyCredits={handleBuyCredits}
            />
        );
    }

    if (view === 'login') {
        return (
            <LoginPage
                onSuccess={handleLoginSuccess}
                onSwitchToSignup={() => setView('signup')}
            />
        );
    }

    if (view === 'signup') {
        return (
            <SignupPage
                onSuccess={handleSignupSuccess}
                onSwitchToLogin={() => setView('login')}
            />
        );
    }

    if (view === 'dashboard') {
        return (
            <Dashboard
                onNewProject={handleNewProject}
                onLoadProject={handleLoadProject}
                onLogout={handleLogout}
                onAdminClick={isAdmin ? () => setView('admin') : undefined}
            />
        );
    }

    if (view === 'adminLogin') {
        return (
            <AdminLoginPage onSuccess={handleAdminLoginSuccess} />
        );
    }

    if (view === 'admin') {
        if (!isAdminAuthenticated) {
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
            />
        );
    }

    return null;
};

export default AppRouter;
