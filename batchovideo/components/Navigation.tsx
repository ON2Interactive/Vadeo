import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
    onGetStarted?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onGetStarted }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        }}>
            <div style={{
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                {/* Logo - Flush Left */}
                <div
                    onClick={() => handleNavigation('/')}
                    style={{
                        height: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <img
                        src="/batchoVideo.svg"
                        alt="batchoVideo"
                        style={{ height: '100%' }}
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
                        onClick={() => handleNavigation('#pricing')}
                        className="text-white hover:text-blue-400 transition-colors text-[0.95rem]"
                    >
                        Pricing
                    </button>

                    <button
                        onClick={() => handleNavigation('/signin')}
                        className="text-white hover:text-blue-400 transition-colors text-[0.95rem]"
                    >
                        Sign In
                    </button>

                    {/* Removed blue button styling, kept text link for desktop consistency or removed as per request for consistency? 
                        User said "Remove the Blue Button". Usually this means removing the button style. 
                        I'll keep "Get Started" as a simple link for now or just remove it if redundant?
                        User said nav reveals "Pricing and Sign up". Maybe "Get Started" is removed?
                        The Request "Remove the Blue Button... use a response menu... reveals Pricing and Sign up".
                        This suggests Get Started might not be needed in nav anymore. 
                        But usually 'Sign In' vs 'Get Started' is good. 
                        I will remove "Get Started" from nav completely based on "reveals Pricing and Sign up".
                     */}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/5 py-4 px-8 flex flex-col gap-4">
                    <button
                        onClick={() => handleNavigation('#pricing')}
                        className="text-white text-left py-2 hover:text-blue-400 transition-colors"
                    >
                        Pricing
                    </button>
                    <button
                        onClick={() => handleNavigation('/signup')}
                        className="text-white text-left py-2 hover:text-blue-400 transition-colors"
                    >
                        Sign Up
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
