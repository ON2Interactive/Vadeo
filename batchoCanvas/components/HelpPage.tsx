import React from 'react';
import { Mail, MessageCircle, FileText, BookOpen } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

interface HelpPageProps {
    onStartEditing?: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onStartEditing }) => {

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
            <section className="relative z-10 px-8 py-[100px] min-h-[800px] flex flex-col items-center justify-center max-w-[1400px] mx-auto text-center">
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">
                    Help Center
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    Everything you need to know about using BatchoCanvas.
                </p>
            </section>

            {/* Help Content */}
            <section className="relative z-10 px-8 py-16 max-w-7xl mx-auto -mt-[200px]">
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Contact Support */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-blue-500/30 transition-all group">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Mail size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Contact Support</h3>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                Need help with your account or having trouble with the editor? Our team is here to help.
                            </p>
                            <a href="mailto:support@batchocanvas.com" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors inline-flex items-center gap-2">
                                Email Support
                            </a>
                        </div>
                    </div>

                    {/* Documentation (Placeholder/Link to Tutorials) */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-purple-500/30 transition-all group">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <BookOpen size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Tutorials & Guides</h3>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                Learn the basics of BatchoCanvas, from creating your first scene to exporting your video.
                            </p>
                            <a href="/tutorials" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors inline-flex items-center gap-2">
                                View Tutorials
                            </a>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HelpPage;
