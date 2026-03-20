import React from 'react';
import { Share2, ShoppingBag, Megaphone, Smartphone, Presentation, Layout, ArrowRight } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

interface UseCasesPageProps {
    onStartEditing?: () => void;
}

const UseCasesPage: React.FC<UseCasesPageProps> = ({ onStartEditing }) => {

    // Scroll to top on mount to ensure user sees the header
    React.useEffect(() => {
        console.log('UseCasesPage: Component Mounted'); // DEBUG
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Fallback for when not passed from router (e.g. direct link)
    const handleStartEditing = onStartEditing || (() => window.location.href = '/signup');
    const handleBuyCredits = () => window.location.href = '/#pricing'; // Redirect to landing pricing

    return (
        <div className="w-full bg-black text-white min-h-screen font-['Inter']">
            {/* Subtle Grid Pattern Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            {/* Blue Glow Effects - Matching BatchoCanvas */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <Navigation />

            {/* Hero Section */}
            <section className="relative z-10 px-8 py-[100px] min-h-[800px] flex flex-col items-center justify-center max-w-[1400px] mx-auto text-center">
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">
                    Use Cases
                </h1>
                <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    Whether you're building a brand, selling products, or sharing stories, BatchoCanvas gives you the freedom to design without limits.
                </p>
            </section>

            {/* Use Cases Grid */}
            <section className="relative z-10 px-8 py-16 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Social Media */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-blue-500/30 transition-all group">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Share2 size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Social Media</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Create consistent, branded content for Instagram, TikTok, and LinkedIn. Design templates once and reuse them for every post.
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li>• Instagram Stories & Reels</li>
                            <li>• LinkedIn Carousels</li>
                            <li>• TikTok Text Overlays</li>
                        </ul>
                    </div>

                    {/* E-Commerce */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-emerald-500/30 transition-all group">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <ShoppingBag size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">E-Commerce</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Showcase products with dynamic video ads. Combine product shots, pricing, and features into high-converting video assets.
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li>• Product Demo Videos</li>
                            <li>• Sale Announcements</li>
                            <li>• Shopify Video Covers</li>
                        </ul>
                    </div>

                    {/* Marketing */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-purple-500/30 transition-all group">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <Megaphone size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Marketing</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Produce professional ads and promotional materials without a full video team. Iterate quickly on copy and visuals.
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li>• Performance Marketing Ads</li>
                            <li>• Event Promos</li>
                            <li>• Brand Intros</li>
                        </ul>
                    </div>

                    {/* Mobile Apps */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-orange-500/30 transition-all group">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                            <Smartphone size={24} className="text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">App Previews</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Design sleek App Store previews and mockups. Frame your screen recordings with device bezels and text.
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li>• App Store Screenshots</li>
                            <li>• Feature Explainers</li>
                            <li>• Device Mockups</li>
                        </ul>
                    </div>

                    {/* Presentations */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-pink-500/30 transition-all group">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                            <Presentation size={24} className="text-pink-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Presentations</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Move beyond static slides. Export dynamic video backgrounds or full presentation loops for events and pitches.
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li>• Keynote Backgrounds</li>
                            <li>• Digital Signage</li>
                            <li>• Pitch Decks</li>
                        </ul>
                    </div>

                    {/* Agency Work */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-cyan-500/30 transition-all group">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                            <Layout size={24} className="text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Agencies</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Scale your content production. Create client-specific brand kits and churn out variations in minutes, not hours.
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li>• Client Deliverables</li>
                            <li>• Content Scaling</li>
                            <li>• Rapid Prototyping</li>
                        </ul>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default UseCasesPage;
