import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { getGuideArticle } from './guideContent';

interface GuideDetailPageProps {
    slug: string;
}

const GuideDetailPage: React.FC<GuideDetailPageProps> = ({ slug }) => {
    const guide = getGuideArticle(slug);

    React.useEffect(() => {
        window.scrollTo(0, 0);
        document.title = guide ? `Vadeo | ${guide.title}` : 'Vadeo | Guides';
    }, [guide]);

    if (!guide) {
        return (
            <div className="w-full min-h-screen bg-black font-['Inter'] text-white">
                <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
                <Navigation />
                <section className="relative z-10 max-w-4xl mx-auto px-8 py-[160px] text-center">
                    <h1 className="mb-4 text-4xl font-black">Guide not found</h1>
                    <p className="text-zinc-400">The guide you requested is not available.</p>
                    <a
                        href="/guides"
                        className="mt-8 inline-flex rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-blue-500/50 hover:text-blue-300"
                    >
                        Back to Guides
                    </a>
                </section>
                <Footer />
            </div>
        );
    }

    const Icon = guide.icon;

    return (
        <div className="w-full min-h-screen bg-black font-['Inter'] text-white">
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <Navigation />

            <section className="relative z-10 max-w-5xl mx-auto px-8 pt-[140px] pb-16">
                <a
                    href="/guides"
                    className="mb-8 inline-flex rounded-full border border-zinc-800/80 bg-zinc-900/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-blue-500/40 hover:text-white"
                >
                    Back to Guides
                </a>
                <div className="max-w-3xl">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                        <Icon size={26} className="text-blue-400" />
                    </div>
                    <h1 className="mb-6 text-[40px] font-black leading-tight tracking-[-0.04em] max-[640px]:text-[30px]">
                        {guide.title}
                    </h1>
                    <p className="text-xl leading-relaxed text-zinc-400 max-[640px]:text-lg">
                        {guide.intro}
                    </p>
                </div>
            </section>

            <section className="relative z-10 max-w-5xl mx-auto px-8 pb-28">
                <div className="space-y-6">
                    {guide.sections.map((section) => (
                        <div
                            key={section.title}
                            className="rounded-2xl border border-zinc-800/60 bg-zinc-900/25 p-8 backdrop-blur"
                        >
                            <h2 className="mb-3 text-2xl font-bold">{section.title}</h2>
                            <p className="max-w-3xl leading-relaxed text-zinc-300">{section.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default GuideDetailPage;
