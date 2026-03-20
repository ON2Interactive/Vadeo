import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface ContactPageProps {
    onStartEditing?: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onStartEditing }) => {

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
            <section className="relative z-10 px-8 py-[100px] min-h-[600px] flex flex-col items-center justify-center max-w-[1400px] mx-auto text-center">
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">
                    Contact
                </h1>
                <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    Have a question? We're here to help.
                </p>
            </section>

            {/* Contact Form Section */}
            <section className="relative z-10 px-8 py-16 max-w-2xl mx-auto -mt-[200px]">
                <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 md:p-12 shadow-2xl">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-zinc-300">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="Your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-zinc-300">Message</label>
                            <textarea
                                id="message"
                                rows={4}
                                className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                                placeholder="How can we help you?"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-lg transition-all transform active:scale-95"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
