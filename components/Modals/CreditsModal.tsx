import React, { useState } from 'react';
import { X, Zap, Crown, Building2, Loader2, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { STRIPE_CONFIG } from '../../stripeConfig';

interface Props {
    onClose: () => void;
    onSelectPlan: (planId: 'STARTER' | 'PRO' | 'BRAND') => void;
}

const CreditsModal: React.FC<Props> = ({ onClose, onSelectPlan }) => {
    // ...
    if (window.confirm("DEV MODE: Reset credits to 1000?")) {
        onSelectPlan('PRO');
        onClose();
    }
    // ...
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const packs = [
        {
            id: 'STARTER',
            name: 'Starter',
            price: 19,
            billingLabel: 'Workspace-only access',
            icon: Zap,
            color: 'emerald',
            desc: 'Best for designing in the workspace before you generate.',
            popular: false,
            features: ['Build and edit in the canvas', '0 video generations included']
        },
        {
            id: 'PRO',
            name: 'Standard',
            price: 79,
            billingLabel: '20 video generations / month',
            icon: Crown,
            color: 'blue',
            desc: 'Most popular for creators producing ads regularly.',
            popular: true,
            features: ['Generate in 1080p', 'Workspace access included', 'Upgrade path to Premium']
        },
        {
            id: 'BRAND',
            name: 'Premium',
            price: 159,
            billingLabel: '20 video generations / month',
            icon: Building2,
            color: 'violet',
            desc: 'For premium campaign work and 4K delivery.',
            popular: false,
            features: ['Generate up to 4K', 'Workspace access included', 'Highest output tier']
        }
    ];

    const handleBuy = (pack: typeof packs[0]) => {
        setLoadingTier(pack.id);

        if (!STRIPE_CONFIG.IS_LIVE) {
            // Simulation Mode
            setTimeout(() => {
                onSelectPlan(pack.id as 'STARTER' | 'PRO' | 'BRAND');
                setLoadingTier(null);
                onClose();
            }, 1500);
        } else {
            // Real Mode
            const link = STRIPE_CONFIG.LINKS[pack.id as keyof typeof STRIPE_CONFIG.LINKS];
            if (link) {
                // Save pending purchase for notification on return
                localStorage.setItem('pending_purchase', JSON.stringify({
                    planName: pack.name,
                    price: pack.price,
                    billingPeriod: 'month',
                    includedGenerations: pack.id === 'STARTER' ? 0 : 20,
                    resolution: pack.id === 'PRO' ? '1080p' : pack.id === 'BRAND' ? '4K' : 'Workspace only'
                }));
                window.location.href = link;
            } else {
                alert("Payment link not configured.");
                setLoadingTier(null);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl">
                <button onClick={onClose} className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
                    <p className="text-zinc-400">Start with workspace access, then upgrade for 1080p or 4K video generations.</p>
                    {!STRIPE_CONFIG.IS_LIVE && (
                        <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold">
                            <AlertCircle size={12} />
                            SIMULATION MODE ACTIVE
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {packs.map((pack) => {
                        const isLoading = loadingTier === pack.id;
                        const isPopular = pack.popular;
                        const colorClass =
                            pack.color === 'emerald' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:border-emerald-500/50' :
                                pack.color === 'blue' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10 hover:border-blue-500/50' :
                                    'text-violet-400 border-violet-500/20 bg-violet-500/10 hover:border-violet-500/50';

                        const btnClass =
                            pack.color === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-900/20' :
                                pack.color === 'blue' ? 'bg-blue-500 hover:bg-blue-400 shadow-blue-900/20' :
                                    'bg-violet-500 hover:bg-violet-400 shadow-violet-900/20';

                        return (
                            <div
                                key={pack.id}
                                className={`relative bg-[#0f0f11] border rounded-2xl p-6 transition-all duration-300 ${isPopular ? 'border-blue-500/50 shadow-2xl scale-105 z-10' : 'border-white/5 hover:border-white/10'}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass.split(' ')[2]}`}>
                                        <pack.icon size={20} className={colorClass.split(' ')[0]} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{pack.name}</h3>
                                        <p className="text-xs text-zinc-500">{pack.desc}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white">${pack.price}</span>
                                        <span className="text-zinc-500 text-sm font-medium ml-1">/ month</span>
                                    </div>
                                    <div className={`text-sm font-bold mt-1 ${colorClass.split(' ')[0]}`}>
                                        {pack.billingLabel}
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    {pack.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                            <CheckCircle2 size={14} className={colorClass.split(' ')[0]} />
                                            {feat}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleBuy(pack)}
                                    disabled={!!loadingTier}
                                    className={`w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${btnClass}`}
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <pack.icon size={18} />}
                                    {isLoading ? 'Processing...' : 'Choose Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <button
                        onClick={() => {
                            if (window.confirm("DEV MODE: Reset credits to 1000?")) {
                                onSelectPlan('PRO');
                                onClose();
                            }
                        }}
                        className="text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-widest font-bold transition-colors"
                    >
                        Dev: Reset Plan State
                    </button>
                    <p className="mt-2 text-[10px] text-zinc-700">
                        Secure payments processed by Stripe.
                    </p>
                </div>
            </div>
        </div >
    );
};

export default CreditsModal;
