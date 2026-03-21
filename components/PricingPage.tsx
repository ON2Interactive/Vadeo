import React from 'react';
import { Zap, Download, Sparkles, Crown, Layers } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';
import { beginStripeCheckout } from '../lib/stripeCheckout';

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
        beginStripeCheckout(planId, {
            successPath: '/editor',
            cancelPath: '/pricing',
        }).catch((error) => {
            console.error('Pricing checkout failed:', error);
            window.location.href = '/signup';
        });
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
                    Pricing
                </h1>
                <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    Start with workspace access, then upgrade for 1080p or 4K video generations as your production needs grow.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        window.location.href = '/signup';
                    }}
                    className="text-[18px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                    Start Free Trial
                </button>

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
                    {/* Starter */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-emerald-500/50 transition-all">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                    <Zap size={16} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Starter</h3>
                            </div>
                            <div className="text-4xl font-bold">$19</div>
                            <div className="text-emerald-400 font-semibold">Workspace-only access</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex items-center gap-2">
                                <Download size={16} className="text-emerald-400" />
                                Build and edit in the canvas
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles size={16} className="text-emerald-400" />
                                0 video generations included
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500">
                            Best for getting into the workspace, building scenes, and upgrading when you are ready to generate.
                        </p>

                        <div className="text-xs text-emerald-400 font-semibold">
                            ✓ Build before you upgrade
                        </div>

                        <button onClick={() => handleBuyCredits('STARTER')} className="w-full py-3 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Standard - Most Popular */}
                    <div className="bg-zinc-900/30 backdrop-blur border-2 border-blue-500/50 rounded-2xl p-8 space-y-6 relative scale-105 shadow-2xl shadow-blue-900/20">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                            Most Popular
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <Crown size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Standard</h3>
                            </div>
                            <div className="text-4xl font-bold">$79</div>
                            <div className="text-blue-400 font-semibold">20 video generations / month</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex items-center gap-2">
                                <Download size={16} className="text-blue-400" />
                                Generate in 1080p
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles size={16} className="text-blue-400" />
                                Workspace access included
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500">
                            Ideal for creators and brands producing campaign-ready ads on a regular schedule.
                        </p>

                        <div className="text-xs text-blue-400 font-semibold">
                            ✓ 1080p video generations included
                        </div>

                        <button onClick={() => handleBuyCredits('PRO')} className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors">
                            Get Started
                        </button>
                    </div>

                    {/* Premium */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 space-y-6 hover:border-violet-500/50 transition-all">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
                                    <Layers size={16} className="text-violet-400" />
                                </div>
                                <h3 className="text-xl font-semibold">Premium</h3>
                            </div>
                            <div className="text-4xl font-bold">$159</div>
                            <div className="text-violet-400 font-semibold">20 video generations / month</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li className="flex items-center gap-2">
                                <Download size={16} className="text-violet-400" />
                                Generate up to 4K
                            </li>
                            <li className="flex items-center gap-2">
                                <Sparkles size={16} className="text-violet-400" />
                                Workspace access included
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500">
                            Built for higher-end delivery when you need 4K output for premium campaign work.
                        </p>

                        <div className="text-xs text-violet-400 font-semibold">
                            ✓ 4K video generations included
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
                        Monthly plans
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Upgrade to generate
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Workspace access on every plan
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        1080p and 4K output
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PricingPage;
