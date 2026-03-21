import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import vadeoLogoWhite from '../Logo/vADeo-Logo-White.svg';

interface NavigationProps {
    onGetStarted?: () => void;
    ctaLabel?: string;
    ctaPath?: string;
}

const Navigation: React.FC<NavigationProps> = ({ onGetStarted, ctaLabel = 'Get Started', ctaPath = '/signup' }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    React.useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollingUp = currentScrollY < lastScrollY;
            const nearTop = currentScrollY < 24;

            setIsVisible(nearTop || scrollingUp);
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (path: string) => {
        if (path.startsWith('#')) {
            const element = document.querySelector(path);
            element?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(path);
        }
        setIsMenuOpen(false);
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 220ms ease',
        }}>
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div
                    onClick={() => handleNavigation('/')}
                    className="cursor-pointer flex items-center"
                >
                    <img
                        src={vadeoLogoWhite}
                        alt="Vadeo"
                        className="h-7 w-auto max-[480px]:h-6"
                    />
                </div>

                {/* Mobile Menu Button - Show on small screens */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white p-2"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Desktop Menu Items - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => handleNavigation('/pricing')}
                        className="text-white hover:text-zinc-400 transition-colors text-[0.95rem]"
                    >
                        Pricing
                    </button>

                    <button
                        onClick={() => handleNavigation(ctaPath)}
                        className="text-white hover:text-zinc-400 transition-colors text-[0.95rem]"
                    >
                        {ctaLabel}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/5 py-4 px-8 flex flex-col gap-4">
                    <button
                        onClick={() => handleNavigation('/pricing')}
                        className="text-white text-left py-2 hover:text-zinc-400 transition-colors"
                    >
                        Pricing
                    </button>
                    <button
                        onClick={() => handleNavigation(ctaPath)}
                        className="text-white text-left py-2 hover:text-zinc-400 transition-colors"
                    >
                        {ctaLabel}
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
