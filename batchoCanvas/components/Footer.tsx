import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    interface FooterLink {
        label: string;
        path: string;
        external?: boolean;
        icon?: React.ElementType;
    }

    interface FooterSection {
        title: string;
        links: FooterLink[];
    }

    const handleNavigation = (path: string) => {
        navigate(path);
        window.scrollTo(0, 0); // Instant jump for page changes
    };

    const footerSections: FooterSection[] = [
        {
            title: 'Product',
            links: [
                { label: 'Features', path: '/#features' },
                { label: 'Pricing', path: '/pricing' },
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
            ]
        },
        {
            title: 'Legal',
            links: [
                { label: 'Terms of Use', path: '/terms' },
                { label: 'Privacy Policy', path: '/privacy' },
                { label: 'Cookie Policy', path: '/cookie' },
                { label: 'DMCA Notice', path: '/dmca' },
            ]
        },
        {
            title: 'KeepUp',
            links: [
                { label: 'Facebook', path: 'https://www.facebook.com/BatchoAI/', external: true, icon: Facebook },
                { label: 'Instagram', path: 'https://www.instagram.com/batchoai/', external: true, icon: Instagram },
                { label: 'LinkedIn', path: 'https://www.linkedin.com/company/on2interactive', external: true, icon: Linkedin },
            ]
        }
    ];

    return (
        <footer style={{
            background: '#000',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '100px 2rem 3rem',
            minHeight: '400px',
            width: '100%',
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
            }}>
                {/* Logo - Flushed Right */}
                <div style={{
                    marginBottom: '4rem',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'flex-end',
                }}>
                    <button
                        onClick={() => handleNavigation('/')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            height: 'auto'
                        }}
                    >
                        <img
                            src="/batchoCanvas-Logo-White.svg"
                            alt="batchoCanvas"
                            className="h-[20px] min-[993px]:h-[40px]"
                            style={{ opacity: 0.9, width: 'auto' }}
                        />
                    </button>
                </div>

                {/* Footer Columns - 2 Column Layout, Right Aligned */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '4rem',
                    marginBottom: '4rem',
                    textAlign: 'right',
                    width: 'fit-content',
                }}>
                    {/* First Column: Product & Resources */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {[footerSections[0], footerSections[1]].map((section, idx) => (
                            <div key={idx}>
                                <h3 style={{
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    marginBottom: '1.5rem',
                                    letterSpacing: '0.05em',
                                }}>
                                    {section.title}
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {section.links.map((link, linkIdx) => (
                                        <li key={linkIdx} style={{ marginBottom: '1rem' }}>
                                            {link.external ? (
                                                <a
                                                    href={link.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#888',
                                                        fontSize: '1rem',
                                                        textDecoration: 'none',
                                                        transition: 'color 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.6rem',
                                                        justifyContent: 'flex-end'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                                                >
                                                    {link.label}
                                                    {link.icon && <link.icon size={18} />}
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => handleNavigation(link.path)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#888',
                                                        fontSize: '1rem',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        textAlign: 'right',
                                                        transition: 'color 0.2s'
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

                    {/* Second Column: Legal & Connect */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                        {[footerSections[2], footerSections[3]].map((section, idx) => (
                            <div key={idx}>
                                <h3 style={{
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    marginBottom: '1.5rem',
                                    letterSpacing: '0.05em',
                                }}>
                                    {section.title}
                                </h3>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: section.title === 'KeepUp' ? 'row' : 'column',
                                    gap: section.title === 'KeepUp' ? '1.5rem' : '1rem',
                                    justifyContent: 'flex-end'
                                }}>
                                    {section.links.map((link, linkIdx) => (
                                        <div key={linkIdx}>
                                            {link.external ? (
                                                <a
                                                    href={link.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={link.label}
                                                    style={{
                                                        color: '#888',
                                                        fontSize: '1rem',
                                                        textDecoration: 'none',
                                                        transition: 'color 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.6rem',
                                                        justifyContent: 'flex-end'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                                                >
                                                    {section.title !== 'KeepUp' && link.label}
                                                    {link.icon && <link.icon size={20} />}
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => handleNavigation(link.path)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#888',
                                                        fontSize: '1rem',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        textAlign: 'right',
                                                        transition: 'color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#888'}
                                                >
                                                    {link.label}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '2rem',
                    textAlign: 'center',
                    marginTop: 'auto',
                    width: '100%',
                }}>
                    <p style={{
                        color: '#666',
                        fontSize: '0.875rem',
                        margin: 0,
                    }}>
                        © batchoCanvas 2026 All Rights Reserved
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
