import React, { useState } from 'react';
import { ArrowRight, Video, Layers, Type, Download, Cloud, Zap, Sparkles, Crown, Grid, Palette, Group, FileText, Send, Scissors, Timer } from 'lucide-react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { dbHelpers } from './lib/supabase';
import { useRecaptcha } from './hooks/useRecaptcha';

interface NewLandingPageProps {
    onStartEditing: () => void;
    onBuyCredits: (planId: 'STARTER' | 'PRO' | 'BRAND') => void;
}

const NewLandingPage: React.FC<NewLandingPageProps> = ({ onStartEditing, onBuyCredits }) => {
    const [soonFormData, setSoonFormData] = useState({ name: '', email: '' });
    const [soonSubmitted, setSoonSubmitted] = useState(false);
    const { executeRecaptcha } = useRecaptcha();

    React.useEffect(() => {
        document.title = "BatchoCanvas | Canvas for Structured Design";
    }, []);

    const handleSoonSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await executeRecaptcha('UPCOMING_FEATURE');
        if (!token) return;

        try {
            await dbHelpers.sendEmail({
                to: soonFormData.email,
                subject: 'Upcoming Feature Notification Request: Image + Video Edits',
                message: `User ${soonFormData.name} wants to be notified about Image + Video Edits feature.`,
                type: 'contact'
            });
            setSoonSubmitted(true);
            setSoonFormData({ name: '', email: '' });
            setTimeout(() => setSoonSubmitted(false), 5000);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full bg-black text-white min-h-screen font-['Inter']">
            {/* Subtle Grid Pattern Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            {/* Blue Glow Effects - Matching BatchoCanvas */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <Navigation onGetStarted={onStartEditing} />

            {/* Hero Section */}
            <section className="relative w-full aspect-video max-h-[85vh] flex items-center justify-center overflow-hidden bg-black border-b border-white/5">
                {/* Background Video */}
                <div className="absolute inset-0 z-0 max-[480px]:mt-20">
                    <video
                        src="/BatchoCanvas.mp4?v=1.2"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover max-[480px]:object-contain"
                    />
                    {/* Subtle Gradient Fade at the bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
                </div>
            </section>

            {/* Product Showcase */}
            <section id="features" className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-4">Freeform Design on Canvas</h1>
                    <p className="text-zinc-400 text-lg">
                        Animate. Layers · Scenes · Aspect Ratios · Video Export
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
                    {/* Feature 1 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Layers size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold">Video Layers</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Add and layer multiple video clips with precise control over positioning and timing.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                            <Type size={24} className="text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold">Text & Shapes</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Professional text overlays and graphics with full customization options.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                            <Download size={24} className="text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold">Export to Video</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            High-quality video export optimized for web and social media.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                            <Cloud size={24} className="text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold">Cloud Saving</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Projects saved automatically to the cloud. Access from anywhere.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                            <Zap size={24} className="text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold">Auto-Save</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Never lose your work with automatic saving every 30 seconds.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                            <Sparkles size={24} className="text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold">AI Generation</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Generate video content with AI. Transform images into motion.
                        </p>
                    </div>

                    {/* Feature 7 - Grids */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                            <Grid size={24} className="text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold">Layout Grids</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Perfect your composition with Rule of Thirds, Golden Ratio, and Swiss grids.
                        </p>
                    </div>

                    {/* Feature 8 - Blend Modes */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                            <Palette size={24} className="text-rose-400" />
                        </div>
                        <h3 className="text-xl font-bold">Blend Modes</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Create professional composites using Multiply, Screen, Overlay, and more.
                        </p>
                    </div>

                    {/* Feature 9 - Smart Grouping */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                            <Group size={24} className="text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold">Smart Grouping</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Group elements together to move, resize, and style them as a single unit.
                        </p>
                    </div>

                    {/* Feature 10 - PDF Export */}
                    <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-xl p-8 space-y-4 hover:border-zinc-700 transition-all group">
                        <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <FileText size={24} className="text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold">Export to PDF</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            Export your video frames or layouts as high-quality PDF documents for storyboards.
                        </p>
                    </div>
                </div>
            </section >

            {/* A New Kind of Freeform Design Tool */}
            < section className="relative z-10 px-8 py-24 max-w-[1400px] mx-auto text-center" >
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-2">A New Kind of Freeform Design Tool</h1>
                    <h3 className="text-xl md:text-2xl font-semibold mb-6 text-zinc-400">Export Layout as Video</h3>
                </div>

                <img
                    src="/Screenshot LP.png"
                    alt="BatchoCanvas Interface"
                    className="w-full h-auto rounded-lg shadow-2xl border border-zinc-800 mb-6"
                />

                <div className="max-w-4xl mx-auto space-y-2 text-zinc-300 text-lg md:text-xl leading-relaxed">
                    <p>
                        <span className="text-white font-semibold">BatchoCanvas</span> is a design canvas with a built-in animation timeline.
                    </p>
                    <p>
                        Animate images, text, and shapes on the canvas, use masking and blend modes for precision, and export as images, videos, or PDFs—without switching tools.
                    </p>
                    <p className="text-white font-bold text-xl md:text-2xl pt-8 tracking-tight">
                        No workarounds. No compromises.
                    </p>
                </div>
            </section >

            {/* New Features Section */}
            < section className="relative z-10 px-8 py-24 bg-zinc-950/50 border-y border-zinc-900" >
                <div className="max-w-[1400px] mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-4">New Features</h1>
                        <p className="text-base text-zinc-400 font-medium">The most requested tools, now natively in BatchoCanvas.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Masking */}
                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-blue-500/50 transition-all group">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                                <Scissors size={24} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Masking</h3>
                            <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                                Shape your vision. Crop and mask videos or images into geometric shapes directly on the canvas.
                            </p>
                        </div>

                        {/* Remix */}
                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-purple-500/50 transition-all group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Remix</h3>
                            <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                                Instant AI Style. Transform your entire design in one click with pro color palettes and typography.
                            </p>
                        </div>

                        {/* Animate */}
                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 hover:border-cyan-500/50 transition-all group">
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform">
                                <Timer size={24} />
                            </div>
                            <h3 className="text-2xl font-black mb-4">Animate</h3>
                            <p className="text-zinc-300 text-lg leading-relaxed mb-6">
                                Precision Timing. Animate layers, sequence scenes, and manage keyframes with a design-first timeline.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why BatchoVideo Section */}
            < section className="relative z-10 px-8 py-24 max-w-4xl mx-auto" >
                <div className="space-y-16">
                    <div>
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">Why BatchoCanvas?</h1>
                        <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
                            <p>
                                BatchoCanvas is built to help creators of all kinds design content quickly and confidently.
                            </p>
                            <p>
                                Whether you’re creating visuals, motion pieces, or presentations, BatchoCanvas lets you work freely on a canvas, animate elements when needed, and export in the format your work requires—without complex tools or rigid workflows.
                            </p>
                            <p className="font-medium text-white">
                                Create faster. Iterate easily. Share everywhere.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">What Can I Create?</h1>
                        <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
                            <p>
                                BatchoCanvas lets you create a wide range of content across multiple canvases within a single project.
                            </p>
                            <p>
                                Design social media posts, posters, animated graphics, short videos, and presentations. Use multiple canvases as scenes to build variations, sequences, or formats—then export each canvas as an image, video, or PDF.
                            </p>
                            <p className="font-medium text-white">
                                Create more, without starting over.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">Built for Creators</h1>
                        <div className="space-y-6 text-zinc-300 text-lg leading-relaxed">
                            <p>
                                BatchoCanvas is built for creators who care about layout, consistency, and speed.
                            </p>
                            <p>
                                Whether you’re making social content, presentations, tutorials, or ads, BatchoCanvas lets you reuse designs, swap media, and produce polished videos without repeating the same edits over and over.
                            </p>
                            <p className="font-medium text-white">
                                Create once. Adapt everywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            {/* Users/Testimonials Section */}
            < section className="relative z-10 px-8 py-24 max-w-7xl mx-auto" >
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black text-center mb-16">Users</h1>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            quote: "BatchoCanvas changed how we produce video layouts. What used to require repeated edits now happens visually on a canvas—and the results are consistently polished.",
                            author: "Jordan P.",
                            role: "Creative Director"
                        },
                        {
                            quote: "I needed professional-looking videos without spending hours editing. BatchoCanvas lets me design once, reuse scenes, and export clean videos whenever I need them.",
                            author: "Elena R.",
                            role: "Independent Creator"
                        },
                        {
                            quote: "Our social videos feel more intentional now. Layouts stay consistent across formats, and exporting different aspect ratios is effortless.",
                            author: "Marcus L.",
                            role: "Growth Marketing Lead"
                        },
                        {
                            quote: "BatchoCanvas fits perfectly into our workflow. We design scenes like pages, swap media, and deliver finished videos faster than ever.",
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
            </section >

            {/* FAQs Section */}
            < section className="relative z-10 px-8 py-24 max-w-4xl mx-auto" >
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black text-center mb-16">FAQs</h1>
                <div className="space-y-8">
                    {[
                        {
                            question: "What is BatchoCanvas?",
                            answer: "BatchoCanvas is a freeform design canvas for creating both static and animated content. Design visually using layers and multiple canvases, animate elements with a built-in timeline, apply masking and blend modes, and export your work as images, videos, or PDFs.",
                        },
                        {
                            question: "Do I need design or animation experience to use it?",
                            answer: "No. BatchoCanvas is built to feel intuitive and approachable. If you’re comfortable working with layers and arranging elements on a canvas, you can start creating right away—no animation or video editing background required."
                        },
                        {
                            question: "How does BatchoCanvas differ from traditional editors?",
                            answer: "Most tools force you to choose between static design and timeline-based editing. BatchoCanvas combines both. You design directly on a canvas, then use the timeline only when you want to animate elements—without disrupting your layout or workflow.",
                        },
                        {
                            question: "Can I export in different formats and sizes?",
                            answer: "Yes. BatchoCanvas supports common aspect ratios as well as custom canvas sizes. You can export each canvas as an image, video, or PDF, depending on how you plan to use it."
                        },
                        {
                            question: "How do multiple canvases (scenes) work?",
                            answer: "You can create multiple canvases within a single project. Each canvas acts like its own scene, making it easy to create variations, sequences, or different formats—then export each one individually or together."
                        },
                        {
                            question: "Are my projects saved?",
                            answer: "Yes. All projects are saved to your account so you can return, edit, and export at any time. Your work stays organized and accessible."
                        },
                        {
                            question: "What types of content is BatchoCanvas best for?",
                            answer: "BatchoCanvas works well for social media content, posters, animated graphics, short videos, presentations, storyboards, and other visual assets—whether static or animated."
                        },
                        {
                            question: "Is BatchoCanvas still evolving?",
                            answer: "Yes. BatchoCanvas is actively developed, with ongoing updates focused on performance, usability, and expanding creative capabilities."
                        },
                        {
                            question: "How much can I create?",
                            answer: "That depends on your plan. You can start for free to explore BatchoCanvas, with options to upgrade for higher limits and additional export capabilities."
                        }
                    ].map((faq, idx) => (
                        <div key={idx} className="space-y-3">
                            <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                            <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section >

            {/* Pricing Section */}
            < section id="pricing" className="relative z-10 px-8 py-24 max-w-7xl mx-auto" >
                <div className="max-w-[800px] mx-auto text-center">
                    <h2 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">A New Kind of Freeform Design Tool</h2>
                    <p className="text-base text-zinc-300 leading-relaxed">
                        BatchoCanvas takes a design-first approach. Instead of a traditional timeline, you build scenes like slides. Layer video, text, and shapes with absolute precision.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    {/* Starter Pack */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 hover:border-emerald-500/50 transition-all group">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Zap size={16} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold">Starter Pack</h3>
                            </div>
                            <div className="text-4xl font-black">$10</div>
                            <div className="text-emerald-400 font-bold">600 credits</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-300">
                            <li className="flex items-center gap-2 font-medium">
                                <Download size={16} className="text-emerald-400" />
                                10 credits / export
                            </li>
                            <li className="flex items-center gap-2 font-medium">
                                <Sparkles size={16} className="text-emerald-400" />
                                10 credits / AI gen
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Best for testing ideas and a few quick projects.
                        </p>

                        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                            ✓ + 50 Free Credits
                        </div>

                        <button onClick={() => onBuyCredits('STARTER')} className="w-full py-4 bg-emerald-500 text-black rounded-full font-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                            Get Started
                        </button>
                    </div>

                    {/* Pro Pack - Most Popular */}
                    <div className="bg-blue-600/10 backdrop-blur-2xl border-2 border-blue-500/50 rounded-2xl p-8 space-y-6 relative scale-105 shadow-2xl shadow-blue-500/20 group">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            Most Popular
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Crown size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold">Pro Pack</h3>
                            </div>
                            <div className="text-4xl font-black">$25</div>
                            <div className="text-blue-400 font-bold">1,800 credits</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-200">
                            <li className="flex items-center gap-2 font-bold">
                                <Download size={16} className="text-blue-400" />
                                10 credits / export
                            </li>
                            <li className="flex items-center gap-2 font-bold">
                                <Sparkles size={16} className="text-blue-400" />
                                10 credits / AI gen
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Ideal for creators and brands running multiple campaigns.
                        </p>

                        <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
                            ✓ + 50 Free Credits
                        </div>

                        <button onClick={() => onBuyCredits('PRO')} className="w-full py-4 bg-blue-500 text-white rounded-full font-black hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20">
                            Get Started
                        </button>
                    </div>

                    {/* Brand Pack */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 hover:border-violet-500/50 transition-all group">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Layers size={16} className="text-violet-400" />
                                </div>
                                <h3 className="text-xl font-bold">Brand Pack</h3>
                            </div>
                            <div className="text-4xl font-black">$50</div>
                            <div className="text-violet-400 font-bold">4,000 credits</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-300">
                            <li className="flex items-center gap-2 font-medium">
                                <Download size={16} className="text-violet-400" />
                                10 credits / export
                            </li>
                            <li className="flex items-center gap-2 font-medium">
                                <Sparkles size={16} className="text-violet-400" />
                                10 credits / AI gen
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Built for high-volume content creators and agencies.
                        </p>

                        <div className="text-[10px] text-violet-400 font-black uppercase tracking-widest">
                            ✓ + 50 Free Credits
                        </div>

                        <button onClick={() => onBuyCredits('BRAND')} className="w-full py-4 bg-violet-500 text-white rounded-full font-black hover:bg-violet-400 transition-colors shadow-lg shadow-violet-500/20">
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
            </section >

            {/* Final Call to Action */}
            <section className="relative z-10 px-8 py-32 overflow-hidden">
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={() => window.location.href = '/signup'}
                            className="w-full sm:w-auto px-12 py-5 bg-transparent border border-white text-white rounded-full text-lg font-black hover:bg-white hover:text-black transition-all"
                        >
                            Try for Free
                        </button>
                    </div>
                </div>
            </section>

            {/* Soon Section */}
            < section className="relative z-10 px-8 py-24 bg-white text-black min-h-[600px] flex flex-col justify-center" >
                <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center gap-12">
                    <div className="space-y-6">
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black tracking-tighter">
                            Soon: Image + Video Edits.
                        </h1>
                        <p className="text-lg text-zinc-600 font-bold text-center">
                            Edit Uploaded Images or Videos Directly on the Canvas.
                        </p>
                    </div>

                    <form onSubmit={handleSoonSubmit} className="w-full max-w-xl space-y-8">
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name"
                                required
                                value={soonFormData.name}
                                onChange={(e) => setSoonFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-transparent border-b border-zinc-300 py-3 px-1 focus:outline-none focus:border-black transition-colors font-bold text-center"
                            />
                            <input
                                type="email"
                                placeholder="eMail"
                                required
                                value={soonFormData.email}
                                onChange={(e) => setSoonFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-transparent border-b border-zinc-300 py-3 px-1 focus:outline-none focus:border-black transition-colors font-bold text-center"
                            />
                        </div>

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={soonSubmitted}
                                className="text-2xl font-black hover:opacity-70 transition-opacity disabled:opacity-50 tracking-tighter"
                            >
                                {soonSubmitted ? 'You\'re on the list!' : 'Notify Me'}
                            </button>
                            <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest text-center">
                                You’ll only hear from us when Image + Video Edits is ready.
                            </p>
                        </div>
                    </form>
                </div>
            </section >

            {/* Footer */}
            < Footer />
        </div >
    );
};

export default NewLandingPage;
