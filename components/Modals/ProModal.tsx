
import React, { useState } from 'react';
import { X, Crown, ShieldCheck, Sparkles, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { STRIPE_CONFIG } from '../../stripeConfig';
import { beginStripeCheckout } from '../../lib/stripeCheckout';

interface Props {
  onClose: () => void;
  onUpgrade: () => void;
}

const ProModal: React.FC<Props> = ({ onClose, onUpgrade }) => {
  const [loading, setLoading] = useState(false);
  const premiumPlan = STRIPE_CONFIG.PLANS.BRAND;

  const isConfigured = STRIPE_CONFIG.IS_LIVE;

  const handleSubscribe = () => {
    setLoading(true);

    if (!isConfigured) {
      // Simulation Mode
      setTimeout(() => {
        onUpgrade();
        setLoading(false);
        onClose();
      }, 1500);
    } else {
      beginStripeCheckout('BRAND', {
        successPath: '/editor',
        cancelPath: '/editor',
      }).catch((error) => {
        console.error('Premium checkout failed:', error);
        setLoading(false);
      });
    }
  };

  // Fixed: Moved Zap definition before it is used in the features array
  const Zap = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );

  const features = [
    { title: '4K Export Access', desc: 'Unlock higher-resolution export when you need premium delivery.', icon: Sparkles },
    { title: 'Premium Plan Upgrade', desc: 'Move beyond Standard when your workflow requires 4K output.', icon: Crown },
    { title: 'Keep Your Workspace', desc: 'Stay in the same workspace and upgrade only when needed.', icon: Zap },
    { title: 'Simple Subscription Flow', desc: 'No top-ups, no pay-as-you-go, just one clear upgrade path.', icon: ShieldCheck },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0f0f11] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Left Side */}
        <div className="w-full md:w-5/12 bg-pro-gradient p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6">
              <Crown size={24} />
            </div>
            <h2 className="text-3xl font-black text-white leading-tight tracking-tighter">
              UPGRADE<br />TO<br />PREMIUM
            </h2>
          </div>
          
          <div className="relative z-10 mt-12">
            {!isConfigured && (
              <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-xl flex gap-2 items-start">
                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-amber-200/70 font-medium leading-relaxed">
                  <span className="text-amber-400 font-bold block mb-0.5">PREVIEW MODE</span>
                  Add <code className="bg-black/30 px-1">STRIPE_SECRET_KEY</code> in Vercel to go live.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-7/12 p-10 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-bold text-white">Unlock 4K export</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 mb-10">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-pro-gradient">
                  <f.icon size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{f.title}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-3xl font-black text-white">${premiumPlan.price}</span>
                <span className="text-zinc-500 text-sm font-medium ml-1">/ month</span>
              </div>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full h-14 bg-pro-gradient hover:opacity-90 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(59,130,246,0.3)]"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : isConfigured ? <ExternalLink size={20} /> : <ShieldCheck size={20} />}
              {loading ? 'Processing...' : isConfigured ? 'Checkout with Stripe' : 'Test Pro (Simulation)'}
            </button>
            <p className="text-[10px] text-zinc-600 text-center mt-4 px-4 leading-relaxed">
              Payments are handled securely on Stripe Checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
