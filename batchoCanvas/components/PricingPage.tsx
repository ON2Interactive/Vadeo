import React from 'react';
import { Zap, Download, Sparkles, Crown, Layers } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

interface PricingPageProps {
    onBuyCredits?: (planId: 'STARTER' | 'PRO' | 'BRAND') => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBuyCredits }) => {

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fallback if not passed
    const handleBuyCredits = onBuyCredits || ((planId) => {
        // Determine redirect based on plan
        const planLink = {
            'STARTER': 'https://buy.stripe.com/test_3cs3do4M85MfaQw288', // Example fallback
            'PRO': 'https://buy.stripe.com/test_14k7pw7Wg2A75wc6oq',
            'BRAND': 'https://buy.stripe.com/test_8wMbDIc8wcYv9UI6op'
        }[planId];
        if (planLink) window.location.href = planLink;
        else window.location.href = '/signup';
    });

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
                    Simple Pricing
                </h1>
                <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    No subscriptions. No expiring credits. Pay once, use anytime.
                </p>

                {/* Pricing Grid - Moved inside Hero strictly or keep separate? 
                    User said "take the pricing section... and put it in the pricing page"
                    User also said "Hero a min-height of 800... Title should be Use Cases (Pricing in this case)"
                    
                    I will place the pricing cards INSIDE this min-height 800 section if it fits, or right below it.
                    Actually, sticking to the layout: Hero is Title + Subtitle. Content follows.
                */}
            </section>

            {/* Pricing Content - Pulling up into the Hero container effectively or just below visually?
                If I put it below, the 800px hero might feel empty. 
                Let's put the grid IN the hero section or immediately following.
                
                Actually, looking at `UseCasesPage`, the grid IS separate.
                "Hero Section... min-height 800... text-center"
                "Use Cases Grid... separate section"
                
                So I will keep them separate to match `UseCasesPage` structure exactly.
            */}

            <section className="relative z-10 px-8 py-16 max-w-7xl mx-auto -mt-[200px]">
                {/* Negative margin to pull it up into the large hero space if needed, 
                    OR just let it flow. The User asked for "exact layout".
                    UseCasesPage has Hero (800px) -> Grid.
                    I will do the same. Hero (800px) -> Pricing Grid.
                */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Starter Pack */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-emerald-500/50 transition-all">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <Zap size={16} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Starter Pack</h3>
                            </div>
                            <div className="text-4xl font-bold">$10</div>
                            <div className="text-emerald-400 font-semibold">600 credits</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex items-center gap-2">
                                <Download size={16} className="text-emerald-400" />
                                10 credits / export
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles size={16} className="text-emerald-400" />
                                10 credits / AI gen
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500">
                            Best for testing ideas and a few quick projects.
                        </p>

                        <div className="text-xs text-emerald-400 font-semibold">
                            ✓ + 50 Free Credits for New Users
                        </div>

                        <button onClick={() => handleBuyCredits('STARTER')} className="w-full py-3 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Pro Pack - Most Popular */}
                    <div className="bg-zinc-900/30 backdrop-blur border-2 border-blue-500/50 rounded-2xl p-8 space-y-6 relative scale-105 shadow-2xl shadow-blue-900/20">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                            Most Popular
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <Crown size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Pro Pack</h3>
                            </div>
                            <div className="text-4xl font-bold">$25</div>
                            <div className="text-blue-400 font-semibold">1,800 credits</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex items-center gap-2">
                                <Download size={16} className="text-blue-400" />
                                10 credits / export
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles size={16} className="text-blue-400" />
                                10 credits / AI gen
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500">
                            Ideal for creators and brands running multiple campaigns.
                        </p>

                        <div className="text-xs text-blue-400 font-semibold">
                            ✓ + 50 Free Credits for New Users
                        </div>

                        <button onClick={() => handleBuyCredits('PRO')} className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Brand Pack */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-violet-500/50 transition-all">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
                                    <Layers size={16} className="text-violet-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Brand Pack</h3>
                            </div>
                            <div className="text-4xl font-bold">$50</div>
                            <div className="text-violet-400 font-semibold">4,000 credits</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex items-center gap-2">
                                <Download size={16} className="text-violet-400" />
                                10 credits / export
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles size={16} className="text-violet-400" />
                                10 credits / AI gen
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500">
                            Built for high-volume content creators and agencies.
                        </p>

                        <div className="text-xs text-violet-400 font-semibold">
                            ✓ + 50 Free Credits for New Users
                        </div>

                        <button onClick={() => handleBuyCredits('BRAND')} className="w-full py-3 bg-violet-500 text-white rounded-full font-semibold hover:bg-violet-600 transition-colors">
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Pricing Benefits */}
                <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        No subscriptions
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Credits never expire
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Design for free
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        4K premium output
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PricingPage;
