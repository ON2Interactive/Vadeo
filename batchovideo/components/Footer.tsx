import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const footerSections = [
        {
            title: 'Product',
            links: [
                { label: 'Features', path: '/#features' },
                { label: 'Pricing', path: '/#pricing' },
                { label: 'Sign In', path: '/signin' },
                { label: 'Get Started', path: '/signup' },
            ]
        },
        {
            title: 'Resources',
            links: [
                { label: 'Use Cases', path: '/use-cases' },
                { label: 'FAQs', path: '/faq' },
                { label: 'Help', path: '/help' },
                { label: 'Tutorials', path: '/tutorials' },
            ]
        },
        {
            title: 'Legal',
            links: [
                { label: 'Terms of Use', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Cookie Policy', path: '/cookies' },
                { label: 'DMCA Notice', path: '/dmca' },
            ]
        },
        {
            title: 'Connect',
            links: [
                { label: 'Contact', path: '/contact' },
                { label: 'Support', path: '/support' },
                { label: 'About', path: '/about' },
                { label: 'Twitter', path: 'https://twitter.com', external: true },
            ]
        }
    ];

    return (
        <footer style={{
            background: '#000',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '4rem 2rem 2rem',
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
            }}>
                {/* Logo */}
                <div style={{
                    height: '24px',
                    marginBottom: '3rem',
                }}>
                    <img
                        src="/batchoVideo.svg"
                        alt="batchoVideo"
                        style={{ height: '100%', opacity: 0.8 }}
                    />
                </div>

                {/* Footer Columns */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem',
                }}>
                    {footerSections.map((section, idx) => (
                        <div key={idx}>
                            <h3 style={{
                                color: '#fff',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                letterSpacing: '0.05em',
                            }}>
                                {section.title}
                            </h3>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                            }}>
                                {section.links.map((link, linkIdx) => (
                                    <li key={linkIdx} style={{ marginBottom: '0.75rem' }}>
                                        {link.external ? (
                                            <a
                                                href={link.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#888',
                                                    fontSize: '0.95rem',
                                                    textDecoration: 'none',
                                                    transition: 'color 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => handleNavigation(link.path)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#888',
                                                    fontSize: '0.95rem',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    textAlign: 'left',
                                                    transition: 'color 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                                            >
                                                {link.label}
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Copyright */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '2rem',
                    textAlign: 'right',
                }}>
                    <p style={{
                        color: '#666',
                        fontSize: '0.875rem',
                        margin: 0,
                    }}>
                        © batchoVideo 2026 All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
