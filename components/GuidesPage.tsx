import React from 'react';
import { BookOpen, Clapperboard, Layers3, Sparkles, Wand2 } from 'lucide-react';
import Navigation from './Navigation';
import Footer from './Footer';

interface GuidesPageProps {
    onStartEditing?: () => void;
}

const guideCards = [
    {
        icon: Layers3,
        title: 'How to Build a Video Ad Scene',
        body: 'Learn how to place visuals on the canvas, structure a scene, add copy, and shape a polished ad layout before export.',
    },
    {
        icon: Clapperboard,
        title: 'How to Use Motion',
        body: 'Upload images or video, set timing, preview movement, and turn one scene into a polished motion-driven ad draft.',
    },
    {
        icon: Sparkles,
        title: 'How to Generate with AI',
        body: 'Use Vadeo generation tools to create ad-ready video from visuals, prompts, and branded direction in 1080p or 4K.',
    },
    {
        icon: Wand2,
        title: 'How to Use Motion AI',
        body: 'Generate an 8-second AI motion scene from an image or frame pair, then refine it with overlays, CTA copy, and export settings.',
    },
    {
        icon: BookOpen,
        title: 'How to Export for Different Placements',
        body: 'Prepare scenes for vertical, square, and widescreen placements so you can deliver social ads, website videos, and campaign assets faster.',
    },
];

const GuidesPage: React.FC<GuidesPageProps> = () => {
    React.useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Vadeo | Guides';
    }, []);

    return (
        <div className="w-full min-h-screen bg-black font-['Inter'] text-white">
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <Navigation />

            <section className="relative z-10 px-8 py-[100px] min-h-[520px] flex flex-col items-center justify-center max-w-[1400px] mx-auto text-center">
                <h1 className="mb-6 text-[36px] font-black max-[480px]:text-[18px] max-[480px]:leading-[1.2]">
                    Guides
                </h1>
                <p className="mx-auto max-w-2xl text-xl leading-relaxed text-zinc-400">
                    Practical how-to guidance for building ad scenes, generating motion, and exporting campaign-ready videos in Vadeo.
                </p>
            </section>

            <section className="relative z-10 -mt-[140px] max-w-7xl mx-auto px-8 pb-24">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {guideCards.map((guide) => {
                        const Icon = guide.icon;
                        return (
                            <div
                                key={guide.title}
                                className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-blue-500/30"
                            >
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Icon size={22} className="text-blue-400" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold">{guide.title}</h2>
                                <p className="leading-relaxed text-zinc-400">{guide.body}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default GuidesPage;
