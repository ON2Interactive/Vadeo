import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface FAQPageProps {
    onStartEditing?: () => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onStartEditing }) => {

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqs = [
        {
            question: "What is BatchoCanvas?",
            answer: "BatchoCanvas is a canvas-based video editor that lets you design videos visually using layers and scenes. You can overlay text and shapes on video, choose your canvas size, and export polished videos without working on a traditional timeline."
        },
        {
            question: "Do I need video editing experience to use it?",
            answer: "No. BatchoCanvas is designed to feel more like a design tool than a traditional video editor. If you can work with layers and pages, you can start creating immediately."
        },
        {
            question: "How does BatchoCanvas differ from timeline editors?",
            answer: "Instead of editing on a timeline, you design directly on a canvas. Videos, text, and shapes are layered visually, scenes act like pages, and layouts stay consistent across exports."
        },
        {
            question: "Can I export in different aspect ratios?",
            answer: "Yes. You can choose from common aspect ratios like 16:9, 9:16, and 1:1—or set custom canvas sizes—and export videos optimized for social, web, or presentations."
        },
        {
            question: "How are scenes used?",
            answer: "Scenes work like pages. Each scene can have its own layout and content, and you can export scenes individually or as part of a full video."
        },
        {
            question: "Are my projects saved?",
            answer: "Yes. Your projects are saved to your account so you can return, edit, and export whenever you need. You stay in full control of your content."
        },
        {
            question: "What types of videos is BatchoCanvas best for?",
            answer: "BatchoCanvas works especially well for social content, marketing videos, presentations, tutorials, product demos, and branded layouts that need consistent design."
        },
        {
            question: "Is BatchoCanvas still improving?",
            answer: "Yes. BatchoCanvas is actively developed, with regular updates focused on performance, usability, and new creative capabilities."
        },
        {
            question: "How many videos can I create?",
            answer: "That depends on your plan. You can start for free to explore the editor, and upgrade for higher limits and expanded export options."
        }
    ];

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
                    FAQs
                </h1>
                <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12">
                    Common questions about creating with BatchoCanvas.
                </p>

                {/* FAQ List - Integrated directly below Hero title/subtitle within the same container width/constraints if needed, 
                    OR separate section. Let's make it a separate section within the flow, but visually connected.
                */}
            </section>

            {/* FAQ Content */}
            <section className="relative z-10 px-8 py-16 max-w-4xl mx-auto -mt-[300px]">
                <div className="space-y-8">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="space-y-3 bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 hover:border-emerald-500/30 transition-all">
                            <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                            <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FAQPage;
