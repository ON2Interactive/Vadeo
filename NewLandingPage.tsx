import React, { useState } from 'react';
import { ArrowRight, Crown, Download, Layers, Scissors, Send, Sparkles, Timer, Zap } from 'lucide-react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import { dbHelpers } from './lib/supabase';
import { useRecaptcha } from './hooks/useRecaptcha';
import heroBackgroundVideo from './Assets/HeroBG.mp4';
import generateDemoVideo from './Assets/V-Demo-01.mp4';
import motionDemoVideo from './Assets/Motion.mp4';
import motionAiDemoVideo from './Assets/Motion-AI.mp4';

interface NewLandingPageProps {
    onStartEditing: () => void;
    onBuyCredits: (planId: 'STARTER' | 'PRO' | 'BRAND') => void;
}

const NewLandingPage: React.FC<NewLandingPageProps> = ({ onStartEditing, onBuyCredits }) => {
    const designWorkflowImage = '/Design-01.png';
    const generateWorkflowImage = '/Generate.png';
    const workspaceUiImage = '/UI.png';
    const [soonFormData, setSoonFormData] = useState({ name: '', email: '' });
    const [soonSubmitted, setSoonSubmitted] = useState(false);
    const { executeRecaptcha } = useRecaptcha();

    React.useEffect(() => {
        document.title = "Create Video Ads with Vadeo";
    }, []);

    const handleSoonSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = await executeRecaptcha('UPCOMING_FEATURE');
        if (!token) return;

        try {
            await dbHelpers.sendEmail({
                to: soonFormData.email,
                subject: 'Upcoming Feature Notification Request: Vadeo Product Updates',
                message: `User ${soonFormData.name} wants to be notified about upcoming Vadeo product updates.`,
                type: 'contact'
            });
            setSoonSubmitted(true);
            setSoonFormData({ name: '', email: '' });
            setTimeout(() => setSoonSubmitted(false), 5000);
        } catch (err) {
            console.error(err);
        }
    };

    const sectionH2ClassName = 'text-[16px] font-bold tracking-[-0.04em] text-white sm:text-[24px] md:text-[30px] lg:text-[36px]';

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
            <Navigation onGetStarted={onStartEditing} ctaLabel="Try It Now" ctaPath="/signup?trial=1" />

            {/* Hero Section */}
            <section className="relative h-screen min-h-screen w-full flex items-center justify-center overflow-hidden bg-black border-b border-white/5">
                <div className="absolute inset-0 z-0">
                    <video
                        src={heroBackgroundVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.18)_38%,rgba(0,0,0,0.58)_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_38%)]" />
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>

                <div className="relative z-10 w-full px-6 sm:px-8">
                    <div className="mx-auto max-w-[860px]">
                        <h1
                            className="text-white text-[18px] sm:text-[28px] md:text-[44px] lg:text-[60px] font-bold leading-[1.05] tracking-[-0.04em]"
                            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 700 }}
                        >
                            Create video ads for social, websites, and campaigns.
                        </h1>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={onStartEditing}
                                className="w-full max-w-[240px] rounded-[6px] border border-white bg-transparent px-6 py-3 text-[18px] font-medium text-white transition-colors hover:bg-white hover:text-black"
                                style={{ fontFamily: 'Helvetica, Arial, sans-serif', borderWidth: '1px' }}
                            >
                                Start Free Trial
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-20 sm:px-8 sm:py-24">
                <div className="mx-auto max-w-[1400px] text-center">
                    <div className="mx-auto max-w-5xl">
                        <h2 className={sectionH2ClassName}>
                            Scene-Based Workspace
                        </h2>
                        <h3 className="mt-4 text-[16px] font-semibold text-white sm:text-[18px] lg:text-[20px]">
                            Design Ads or Generate with AI
                        </h3>
                    </div>

                    <div className="mt-10 overflow-hidden rounded-[18px] border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                        <img
                            src={workspaceUiImage}
                            alt="Vadeo interface"
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="mx-auto mt-8 max-w-5xl space-y-3 text-center text-[16px] leading-relaxed text-white/70">
                        <p>
                            Turn product visuals, campaign assets, and imported footage into ad-ready videos in one workspace. Build, generate, and export polished creative without jumping between separate tools.
                        </p>
                        <h2 className="text-[16px] font-bold tracking-[-0.04em] text-white sm:text-[24px] md:text-[30px] lg:text-[36px]">
                            Built-In Timeline for Animation
                        </h2>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-20 sm:px-8 sm:py-24">
                <div className="mx-auto max-w-[1400px] text-center">
                    <div className="mx-auto max-w-5xl">
                        <h2 className={sectionH2ClassName}>
                            Design
                        </h2>
                        <h3 className="mt-4 text-[16px] font-semibold text-white sm:text-[18px] lg:text-[20px]">
                            Build Your Ad Inside One Workspace
                        </h3>
                    </div>

                    <div className="mt-10 overflow-hidden rounded-[18px] border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                        <img
                            src={designWorkflowImage}
                            alt="Design workflow in Vadeo"
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="mx-auto mt-8 max-w-5xl space-y-3 text-center text-[16px] leading-relaxed text-white/70">
                        <p>
                            Upload product images or footage, arrange scenes on the canvas, and build structured ad concepts for social, websites, and campaign delivery.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-20 sm:px-8 sm:py-24">
                <div className="mx-auto max-w-[1400px] text-center">
                    <div className="mx-auto max-w-5xl">
                        <h2 className={sectionH2ClassName}>
                            Generate Videos with AI
                        </h2>
                        <h3 className="mt-4 text-[16px] font-semibold text-white sm:text-[18px] lg:text-[20px]">
                            Create Video Ads from Your Visuals using AI
                        </h3>
                    </div>

                    <div className="mt-10 overflow-hidden rounded-[18px] border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                        <img
                            src={generateWorkflowImage}
                            alt="Generate workflow in Vadeo"
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="mx-auto mt-8 max-w-5xl space-y-3 text-center text-[16px] leading-relaxed text-white/70">
                        <p>
                            Generate in 1080p or 4K depending on your plan, then refine with sound, narrative, and branded overlays to ship campaign-ready assets faster.
                        </p>
                    </div>

                    <div className="mt-10 overflow-hidden rounded-[18px] border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                        <video
                            src={generateDemoVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="mx-auto mt-8 max-w-5xl space-y-3 text-center text-[16px] leading-relaxed text-white/70">
                        <p>
                            Layer in brand assets, offer copy, titles, icons, and CTA treatments so every export feels campaign-ready instead of generic.
                        </p>
                    </div>
                </div>
            </section>

            <section className="relative z-10 px-6 py-20 sm:px-8 sm:py-24">
                <div className="mx-auto max-w-[1400px]">
                    <div className="mx-auto max-w-5xl text-center">
                        <div className="mb-4 flex justify-center">
                            <span className="rounded-full border border-blue-400/40 bg-blue-500/15 px-4 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                                New
                            </span>
                        </div>
                        <h2 className={sectionH2ClassName}>Motion &amp; Motion AI</h2>
                    </div>

                    <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        <div className="overflow-hidden rounded-[18px] border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                            <video
                                src={motionDemoVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="overflow-hidden rounded-[18px] border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                            <video
                                src={motionAiDemoVideo}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 text-center lg:grid-cols-2">
                        <div className="space-y-3 px-2 py-2">
                            <h3 className="text-[18px] font-bold text-white sm:text-[20px]">Motion</h3>
                            <p className="text-[15px] leading-relaxed text-white/70">
                                Build polished ad scenes from uploaded images or video, sequence the motion on one canvas, and shape the final output with editable overlays, titles, and CTA layers.
                            </p>
                        </div>

                        <div className="space-y-3 px-2 py-2">
                            <h3 className="text-[18px] font-bold text-white sm:text-[20px]">Motion AI</h3>
                            <p className="text-[15px] leading-relaxed text-white/70">
                                Turn a product image or frame references into an AI-generated scene with sound, then refine it inside Vadeo with branded messaging, overlays, and end-card structure.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Showcase */}
            <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24">
                <div className="mb-12 text-center sm:mb-14">
                    <h2 className={sectionH2ClassName}>Freeform Design on Canvas</h2>
                    <p className="mt-3 text-[16px] text-zinc-400 sm:text-[18px]">
                        Upload Images · Generate Motion · Shape Video Ads
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Feature 1 */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Social Media Sizes</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Switch between vertical, square, and widescreen layouts for feeds, reels, stories, and paid placements without rebuilding the ad.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Image-to-Video Workflow</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Start with still images and turn them into motion-ready ad scenes without rebuilding everything by hand.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Ad Copy & Overlays</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Add headlines, offer copy, and supporting graphic elements to shape each ad variation.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Export Video Ads</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Export polished ad creative optimized for paid social, product promos, and campaign testing.
                        </p>
                    </div>

                    {/* Feature 5 */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Project Saving</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Projects saved automatically to the cloud. Access from anywhere.
                        </p>
                    </div>

                    {/* Feature 6 */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Auto-Save</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Never lose your work with automatic saving every 30 seconds.
                        </p>
                    </div>

                    {/* Feature 7 */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">AI Motion Generation</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Generate motion from uploaded images and build video ads around the resulting clips.
                        </p>
                    </div>

                    {/* Feature 8 - Grids */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Layout Guides</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Perfect your composition with Rule of Thirds, Golden Ratio, and Swiss grids.
                        </p>
                    </div>

                    {/* Feature 9 - Blend Modes */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Creative Styling</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Create professional composites using Multiply, Screen, Overlay, and more.
                        </p>
                    </div>

                    {/* Feature 10 - Smart Grouping */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Grouped Elements</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Group elements together to move, resize, and style them as a single unit.
                        </p>
                    </div>

                    {/* Feature 11 - Scene Export */}
                    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-8 backdrop-blur transition-all hover:border-zinc-700">
                        <h3 className="text-xl font-bold">Scene Export</h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            Export individual scenes as polished outputs for review, iteration, and delivery across different ad variations.
                        </p>
                    </div>
                </div>
            </section >

            <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:px-8 sm:py-24">
                <div className="space-y-14 sm:space-y-16">
                    <div>
                        <h2 className={sectionH2ClassName}>Why Vadeo?</h2>
                        <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-white/70">
                            <p>
                                Vadeo is built for advertisers, agencies, creators, web designers, and social marketers who need faster paths from static assets to polished motion creative.
                            </p>
                            <p>
                                Instead of treating every project like a full video edit, Vadeo focuses on the specific job of turning visuals into campaign-ready ads you can ship, test, and adapt quickly.
                            </p>
                            <p className="font-semibold text-white">
                                Create faster. Iterate for every placement. Deliver with confidence.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className={sectionH2ClassName}>What Can I Create?</h2>
                        <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-white/70">
                            <p>
                                Vadeo is built for product promos, paid social creative, landing-page videos, campaign variations, and branded motion assets.
                            </p>
                            <p>
                                Build vertical, square, and landscape versions, test multiple scenes, and adapt a single creative idea across websites, social placements, and client deliverables.
                            </p>
                            <p className="font-semibold text-white">
                                Create more, without starting over.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className={sectionH2ClassName}>Built for Creators</h2>
                        <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-white/70">
                            <p>
                                Vadeo is built for teams that care about output speed, visual consistency, and repeatable ad production.
                            </p>
                            <p>
                                Whether you are producing ecommerce promos, client ads, or paid social variations, the goal is to reuse assets, test ideas quickly, and get polished outputs faster.
                            </p>
                            <p className="font-semibold text-white">
                                Create once. Adapt everywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Users/Testimonials Section */}
            < section className="relative z-10 px-8 py-24 max-w-7xl mx-auto" >
                <h2 className={`${sectionH2ClassName} text-center mb-16`}>Users</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            quote: "Vadeo gives us a faster way to turn static product assets into motion creative we can actually test in campaigns.",
                            author: "Jordan P.",
                            role: "Creative Director"
                        },
                        {
                            quote: "I needed ad-ready videos without hours of editing. Vadeo makes image-first creative feel much more direct.",
                            author: "Elena R.",
                            role: "Independent Creator"
                        },
                        {
                            quote: "Our social videos feel more intentional now. Layouts stay consistent across formats, and exporting different aspect ratios is effortless.",
                            author: "Marcus L.",
                            role: "Growth Marketing Lead"
                        },
                        {
                            quote: "Vadeo fits the way we build campaign variations. We can swap assets, test different directions, and move faster.",
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
                <h2 className={`${sectionH2ClassName} text-center mb-16`}>FAQs</h2>
                <div className="space-y-8">
                    {[
                        {
                            question: "What is Vadeo?",
                            answer: "Vadeo is an image-to-video ad creator built around uploaded stills, generated motion, and campaign-ready video output.",
                        },
                        {
                            question: "Do I need design or animation experience to use it?",
                            answer: "No. The goal is to keep the workflow approachable so you can move from uploaded images to a usable ad without deep editing experience."
                        },
                        {
                            question: "How does Vadeo differ from traditional editors?",
                            answer: "Vadeo is narrower by design. It starts from images and ad generation rather than from a blank timeline, which keeps the process more focused."
                        },
                        {
                            question: "Can I export in different formats and sizes?",
                            answer: "Yes. Vadeo is aimed at the common ad aspect ratios you need for social, ecommerce, and campaign delivery."
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
                            question: "What types of content is Vadeo best for?",
                            answer: "Vadeo is best suited for video ads, product promos, paid social creative, and other campaign-ready outputs built from still imagery or imported video."
                        },
                        {
                            question: "Is Vadeo still evolving?",
                            answer: "Yes. This product is still being adapted and will continue to evolve around generation quality, controls, and ad-focused workflows."
                        },
                        {
                            question: "How much can I create?",
                            answer: "That depends on your plan. You can start small, then expand usage as your ad volume and generation needs grow."
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
                    <h2 className={sectionH2ClassName}>Pricing</h2>
                    <p className="text-base text-zinc-300 leading-relaxed">
                        Start with workspace access, then upgrade for 1080p or 4K generations as your production volume, clients, and campaign needs grow.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    {/* Starter */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 hover:border-emerald-500/50 transition-all group">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Zap size={16} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold">Starter</h3>
                            </div>
                            <div className="text-4xl font-black">$19</div>
                            <div className="text-emerald-400 font-bold">Workspace-only access</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-300">
                            <li className="flex items-center gap-2 font-medium">
                                <Download size={16} className="text-emerald-400" />
                                Build and edit in the canvas
                            </li>
                            <li className="flex items-center gap-2 font-medium">
                                <Sparkles size={16} className="text-emerald-400" />
                                0 video generations included
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Best for designing ads, building scenes, and upgrading when you are ready to generate.
                        </p>

                        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                            ✓ Build before you upgrade
                        </div>

                        <button onClick={() => onBuyCredits('STARTER')} className="w-full py-4 bg-emerald-500 text-black rounded-full font-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                            Get Started
                        </button>
                    </div>

                    {/* Standard - Most Popular */}
                    <div className="bg-blue-600/10 backdrop-blur-2xl border-2 border-blue-500/50 rounded-2xl p-8 space-y-6 relative scale-105 shadow-2xl shadow-blue-500/20 group">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            Most Popular
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Crown size={16} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold">Standard</h3>
                            </div>
                            <div className="text-4xl font-black">$79</div>
                            <div className="text-blue-400 font-bold">20 video generations / month</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-200">
                            <li className="flex items-center gap-2 font-bold">
                                <Download size={16} className="text-blue-400" />
                                Generate in 1080p
                            </li>
                            <li className="flex items-center gap-2 font-bold">
                                <Sparkles size={16} className="text-blue-400" />
                                Workspace access included
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            Ideal for creators and brands producing campaign-ready ads on a regular schedule.
                        </p>

                        <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
                            ✓ 1080p video generations included
                        </div>

                        <button onClick={() => onBuyCredits('PRO')} className="w-full py-4 bg-blue-500 text-white rounded-full font-black hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20">
                            Get Started
                        </button>
                    </div>

                    {/* Premium */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 hover:border-violet-500/50 transition-all group">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Layers size={16} className="text-violet-400" />
                                </div>
                                <h3 className="text-xl font-bold">Premium</h3>
                            </div>
                            <div className="text-4xl font-black">$159</div>
                            <div className="text-violet-400 font-bold">20 video generations / month</div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-300">
                            <li className="flex items-center gap-2 font-medium">
                                <Download size={16} className="text-violet-400" />
                                Generate up to 4K
                            </li>
                            <li className="flex items-center gap-2 font-medium">
                                <Sparkles size={16} className="text-violet-400" />
                                Workspace access included
                            </li>
                        </ul>

                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Built for higher-end delivery when you need 4K output for premium campaign work.
                        </p>

                        <div className="text-[10px] text-violet-400 font-black uppercase tracking-widest">
                            ✓ 4K video generations included
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
            </section >

            {/* Final Call to Action */}
            <section className="relative z-10 px-8 py-32 overflow-hidden">
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            onClick={() => window.location.href = '/signup?trial=1'}
                            className="w-full sm:w-auto px-12 py-5 bg-transparent border border-white text-white rounded-full text-lg font-black hover:bg-white hover:text-black transition-all"
                        >
                            Start Free Trial
                        </button>
                    </div>
                </div>
            </section>

            {/* Soon Section */}
            < section className="relative z-10 px-8 py-24 bg-white text-black min-h-[600px] flex flex-col justify-center" >
                <div className="max-w-4xl mx-auto w-full flex flex-col items-center text-center gap-12">
                    <div className="space-y-6">
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black tracking-tighter">
                            Keep Up
                        </h1>
                        <p className="text-lg text-zinc-600 font-bold text-center">
                            More image-to-video tuning, generation controls, and ad-shaping tools are on the way.
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
                                You’ll only hear from us when new Vadeo features are ready.
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
