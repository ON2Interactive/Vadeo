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
            question: "What is Vadeo?",
            answer: "Vadeo is an image-to-video ad creator. Upload still images, generate motion from them, and assemble polished ad creative for campaigns, social, and product marketing."
        },
        {
            question: "Do I need video editing experience to use it?",
            answer: "No. Vadeo is being shaped to feel lightweight and direct. The goal is to go from uploaded images to a usable video ad without needing traditional editing experience."
        },
        {
            question: "How does Vadeo differ from timeline editors?",
            answer: "Vadeo is focused on ad generation, not full manual editing. Instead of starting from a blank timeline, you begin with product or marketing images and generate motion-ready outputs faster."
        },
        {
            question: "Can I export in different aspect ratios?",
            answer: "Yes. Vadeo will support the common ad and social ratios you need, including landscape, square, and vertical outputs."
        },
        {
            question: "How are scenes used?",
            answer: "Scenes can be used as individual shots or ad beats, letting you sequence product visuals, messaging, and variants inside a single project."
        },
        {
            question: "Are my projects saved?",
            answer: "Yes. Your projects are saved to your account so you can return, edit, and export whenever you need. You stay in full control of your content."
        },
        {
            question: "What types of videos is Vadeo best for?",
            answer: "Vadeo is aimed at video ads, product promos, paid social creative, ecommerce spots, and other campaign-ready marketing videos built from still images or imported video."
        },
        {
            question: "Is Vadeo still evolving?",
            answer: "Yes. This is an active build and the workflow will keep evolving as image-to-video generation, prompts, layouts, and export controls are refined."
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
                    Common questions about creating image-based video ads with Vadeo.
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
