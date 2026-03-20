import React from 'react';
import { ArrowRight, Video, Layers, Type, Download, Cloud, Zap, Sparkles, Crown } from 'lucide-react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

interface NewLandingPageProps {
    onStartEditing: () => void;
    onBuyCredits: (planId: 'STARTER' | 'PRO' | 'BRAND') => void;
}

const NewLandingPage: React.FC<NewLandingPageProps> = ({ onStartEditing, onBuyCredits }) => {
    return (
        <div className="w-full bg-black text-white min-h-screen font-['Inter']">
            {/* Subtle Grid Pattern Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            {/* Blue Glow Effects - Matching BatchoMuse */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <Navigation onGetStarted={onStartEditing} />

            {/* Hero Section */}
            <section className="relative z-10 px-8 pt-[100px] pb-[100px] max-w-7xl mx-auto min-h-[800px] flex items-center">
                <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
                    {/* Left: Text Content */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h1 className="text-[24px] md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                                Design Video on Canvas.
                            </h1>
                            <h1 className="text-[24px] md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Export Clean MP4s.
                            </h1>
                        </div>

                        <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
                            BatchoVideo is a layer-based video canvas for creators who want fast, intentional layout control—without fighting a traditional editor.
                        </p>

                        <div className="space-y-8">
                            <button
                                onClick={onStartEditing}
                                className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-base font-semibold hover:scale-105 transition-all shadow-lg shadow-white/10"
                            >
                                Start Creating
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Visual Demo / Video Placeholder */}
                    <div className="relative">
                        <div className="aspect-video bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-[4px] overflow-hidden shadow-2xl">
                            {/* Placeholder for future video - configured to fill container */}
                            <div className="w-full h-full bg-black relative">
                                <video
                                    src="/demo.mp4"
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                            </div>
                        </div>
                        {/* Subtle glow */}
                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl -z-10 scale-110" />
                    </div>
                </div>
            </section>

            {/* Product Showcase */}
            <section id="features" className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-[18px] md:text-6xl lg:text-7xl font-bold mb-4">Design on Canvas</h1>
                    <p className="text-zinc-400 text-lg">
                        Layers · Scenes · Aspect Ratios · MP4 Export
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {/* Feature 1 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Layers size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Video Layers</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Add and layer multiple video clips with precise control over positioning and timing.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <Type size={24} className="text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Text & Shapes</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Professional text overlays and graphics with full customization options.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                            <Download size={24} className="text-violet-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Export to MP4</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            High-quality video export optimized for web and social media.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                            <Cloud size={24} className="text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Cloud Saving</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Projects saved automatically to the cloud. Access from anywhere.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                            <Zap size={24} className="text-pink-400" />
                        </div>
                        <h3 className="text-xl font-semibold">Auto-Save</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Never lose your work with automatic saving every 30 seconds.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                            <Sparkles size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-semibold">AI Generation</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Generate video content with AI. Transform images into motion.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why BatchoVideo Section */}
            <section className="relative z-10 px-8 py-24 max-w-4xl mx-auto">
                <div className="space-y-16">
                    <div>
                        <h1 className="text-[18px] md:text-6xl lg:text-7xl font-bold mb-6">Why BatchoVideo?</h1>
                        <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
                            <p>
                                Most video editors are built around timelines, tracks, and endless menus.
                                BatchoVideo takes a different approach.
                            </p>
                            <p>
                                Design directly on a canvas. Layer video, text, and shapes with precision. Build scenes like pages, choose your aspect ratio, and export clean MP4 videos—fast.
                            </p>
                            <p className="font-medium text-white">
                                No clutter. No friction. Just intentional video design.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-[18px] md:text-6xl lg:text-7xl font-bold mb-6">Built for Creators</h1>
                        <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
                            <p>
                                BatchoVideo is built for creators who care about layout, consistency, and speed.
                            </p>
                            <p>
                                Whether you’re making social content, presentations, tutorials, or ads, BatchoVideo lets you reuse designs, swap media, and produce polished videos without repeating the same edits over and over.
                            </p>
                            <p className="font-medium text-white">
                                Create once. Adapt everywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Users/Testimonials Section */}
            <section className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
                <h1 className="text-[18px] md:text-6xl lg:text-7xl font-bold text-center mb-16">Users</h1>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            quote: "BatchoVideo changed how we produce video layouts. What used to require timelines and repeated edits now happens visually on a canvas—and the results are consistently polished.",
                            author: "Jordan P.",
                            role: "Creative Director"
                        },
                        {
                            quote: "I needed professional-looking videos without spending hours editing. BatchoVideo lets me design once, reuse scenes, and export clean MP4s whenever I need them.",
                            author: "Elena R.",
                            role: "Independent Creator"
                        },
                        {
                            quote: "Our social videos feel more intentional now. Layouts stay consistent across formats, and exporting different aspect ratios is effortless.",
                            author: "Marcus L.",
                            role: "Growth Marketing Lead"
                        },
                        {
                            quote: "BatchoVideo fits perfectly into our workflow. We design scenes like pages, swap media, and deliver finished videos faster than ever.",
                            author: "Sofia K.",
                            role: "Content Strategist"
                        },
                        {
                            quote: "We finally have a unified visual system for video. Every export looks aligned, on-brand, and ready to publish—no manual fixes required.",
                            author: "Daniel M.",
                            role: "Product Marketing Manager"
                        }
                    ].map((testimonial, idx) => (
                        <div key={idx} className="space-y-4">
                            <p className="text-zinc-300 text-base leading-relaxed">
                                "{testimonial.quote}"
                            </p>
                            <p className="text-zinc-500 text-sm">
                                — {testimonial.author} • {testimonial.role}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQs Section */}
            <section className="relative z-10 px-8 py-24 max-w-4xl mx-auto">
                <h1 className="text-[18px] md:text-6xl lg:text-7xl font-bold text-center mb-16">FAQs</h1>
                <div className="space-y-8">
                    {[
                        {
                            question: "What is BatchoVideo?",
                            answer: "BatchoVideo is a canvas-based video editor that lets you design videos visually using layers and scenes. You can overlay text and shapes on video, choose your canvas size, and export polished MP4 videos without working on a traditional timeline."
                        },
                        {
                            question: "Do I need video editing experience to use it?",
                            answer: "No. BatchoVideo is designed to feel more like a design tool than a traditional video editor. If you can work with layers and pages, you can start creating immediately."
                        },
                        {
                            question: "How does BatchoVideo differ from timeline editors?",
                            answer: "Instead of editing on a timeline, you design directly on a canvas. Videos, text, and shapes are layered visually, scenes act like pages, and layouts stay consistent across exports."
                        },
                        {
                            question: "Can I export in different aspect ratios?",
                            answer: "Yes. You can choose from common aspect ratios like 16:9, 9:16, and 1:1—or set custom canvas sizes—and export MP4 videos optimized for social, web, or presentations."
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
                            question: "What types of videos is BatchoVideo best for?",
                            answer: "BatchoVideo works especially well for social content, marketing videos, presentations, tutorials, product demos, and branded layouts that need consistent design."
                        },
                        {
                            question: "Is BatchoVideo still improving?",
                            answer: "Yes. BatchoVideo is actively developed, with regular updates focused on performance, usability, and new creative capabilities."
                        },
                        {
                            question: "How many videos can I create?",
                            answer: "That depends on your plan. You can start for free to explore the editor, and upgrade for higher limits and expanded export options."
                        }
                    ].map((faq, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                            <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-[18px] md:text-6xl lg:text-7xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-zinc-400 text-lg">
                        No subscriptions. No expiring credits. Pay once, use anytime.
                    </p>
                </div>

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

                        <button onClick={() => onBuyCredits('STARTER')} className="w-full py-3 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors">
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

                        <button onClick={() => onBuyCredits('PRO')} className="w-full py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors">
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

                        <button onClick={() => onBuyCredits('BRAND')} className="w-full py-3 bg-violet-500 text-white rounded-full font-semibold hover:bg-violet-600 transition-colors">
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

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default NewLandingPage;
