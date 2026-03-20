import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface CookiePageProps {
    onStartEditing?: () => void;
}

const CookiePage: React.FC<CookiePageProps> = ({ onStartEditing }) => {

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full bg-black text-white min-h-screen font-['Inter']">
            {/* Subtle Grid Pattern Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            {/* Blue Glow Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Hero Section */}
            <section className="relative z-10 px-8 py-[100px] min-h-[400px] flex flex-col items-center justify-center max-w-[1400px] mx-auto text-center">
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">
                    Cookie Policy
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Last updated: Nov 16, 2025
                </p>
            </section>

            {/* Content Section */}
            <section className="relative z-10 px-8 py-16 max-w-[1200px] mx-auto -mt-[50px]">
                <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 md:p-12 text-zinc-300 leading-relaxed">

                    <div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-400 prose-li:text-zinc-400">
                        <h3 className="text-2xl font-bold mb-6 mt-0">1. What Are Cookies?</h3>
                        <p className="mb-6">
                            Cookies are small text files stored on your device when you visit a website.
                            They help websites function properly, remember your preferences, and improve your browsing experience.
                        </p>
                        <p className="mb-12">
                            Batcho uses cookies and similar technologies to provide, secure, and improve the platform.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">2. How We Use Cookies</h3>
                        <p className="mb-6">
                            Batcho uses cookies for the following purposes:
                        </p>

                        <h4 className="text-xl font-semibold mb-4 mt-8">2.1 Essential Cookies</h4>
                        <p className="mb-4">
                            These cookies are required for the platform to function, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>User login and authentication</li>
                            <li>Session management</li>
                            <li>Security features</li>
                        </ul>
                        <p className="mb-6">
                            Without these cookies, certain features (such as logging in) will not work.
                        </p>

                        <h4 className="text-xl font-semibold mb-4 mt-8">2.2 Performance & Analytics Cookies</h4>
                        <p className="mb-4">
                            These cookies help us understand how users interact with Batcho, allowing us to improve speed, usability, and reliability.
                            Data collected through analytics is non-personal and aggregated.
                        </p>

                        <h4 className="text-xl font-semibold mb-4 mt-8">2.3 Preference Cookies</h4>
                        <p className="mb-4">
                            These store your settings and improve your experience, such as:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Remembering UI preferences</li>
                            <li>Keeping your chosen enhancement options</li>
                            <li>Maintaining session consistency</li>
                        </ul>

                        <h4 className="text-xl font-semibold mb-4 mt-8">2.4 Optional Cookies</h4>
                        <p className="mb-4">
                            If future features require it (e.g., marketing pages), we may use additional cookies to support those functions.
                            You will be notified if additional consent is required.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">3. Third-Party Cookies</h3>
                        <p className="mb-6">
                            Some cookies may be placed by tools that help operate or analyze the platform (for example, login systems, security tools, or usage analytics).
                            These cookies are only used to support Batcho's functionality and performance.
                        </p>
                        <p className="mb-4">
                            We do not use cookies for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>Advertising</li>
                            <li>Cross-site tracking</li>
                            <li>Selling user data</li>
                            <li>Social media profiling</li>
                        </ul>

                        <h3 className="text-2xl font-bold mb-6 mt-12">4. Cookie Control & Your Choices</h3>
                        <p className="mb-6">
                            You can control or disable cookies through your browser settings.
                            However, if you block essential cookies, Batcho may not function properly—especially login and image processing features.
                        </p>
                        <p className="mb-4">
                            Common browser settings for cookie management include:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>Chrome: Settings → Privacy and Security → Cookies</li>
                            <li>Safari: Preferences → Privacy</li>
                            <li>Firefox: Settings → Privacy & Security</li>
                            <li>Edge: Settings → Cookies and site permissions</li>
                        </ul>

                        <h3 className="text-2xl font-bold mb-6 mt-12">5. Changes to This Policy</h3>
                        <p className="mb-4">
                            We may update this Cookie Policy when necessary.
                            The "Last updated" date will reflect any changes.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">6. Contact Us</h3>
                        <p className="mb-6">
                            For any questions about our use of cookies or data practices, contact us at:
                            <br />
                            <a href="mailto:support@batchocanvas.com" className="text-blue-400 hover:text-blue-300 transition-colors">support@batchocanvas.com</a>
                        </p>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CookiePage;
