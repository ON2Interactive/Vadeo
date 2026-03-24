import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { guideArticles, guideFaqs } from './guideContent';

interface GuidesPageProps {
    onStartEditing?: () => void;
}

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
                    {guideArticles.map((guide) => {
                        const Icon = guide.icon;
                        return (
                            <a
                                key={guide.title}
                                href={`/guides/${guide.slug}`}
                                className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-blue-500/30"
                            >
                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Icon size={22} className="text-blue-400" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold">{guide.title}</h2>
                                <p className="leading-relaxed text-zinc-400">{guide.cardBody}</p>
                            </a>
                        );
                    })}
                </div>
            </section>

            <section className="relative z-10 max-w-4xl mx-auto px-8 pb-28">
                <h2 className="mb-16 text-center text-[16px] font-bold tracking-[-0.04em] text-white sm:text-[24px] md:text-[30px] lg:text-[36px]">
                    Using Vadeo Features
                </h2>
                <div className="space-y-8">
                    {guideFaqs.map((item) => (
                        <div key={item.question} className="space-y-3">
                            <h3 className="text-xl font-semibold text-white">{item.question}</h3>
                            <p className="leading-relaxed text-zinc-300">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default GuidesPage;
