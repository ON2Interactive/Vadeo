import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { Users, Target, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <div className="w-full bg-black text-white min-h-screen font-['Inter'] flex flex-col">
            <Navigation />

            {/* Background Effects */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <main className="flex-grow pt-32 pb-24 px-8 relative z-10">
                <div className="max-w-4xl mx-auto space-y-24">
                    {/* Hero Section */}
                    <div className="text-center space-y-6">
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black tracking-tight">
                            About Vadeo
                        </h1>
                        <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            We're building a faster path from still images to ad-ready video.
                            Creative tools for marketing should feel direct, not heavy.
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-4 hover:border-blue-500/30 transition-all">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                                <Target size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Our Mission</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                To make image-to-video ad creation fast, approachable, and reliable for brands, creators, and marketers.
                            </p>
                        </div>

                        <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-4 hover:border-purple-500/30 transition-all">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Who We Are</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                A team shaping a focused creative workflow around uploaded images, generated motion, and faster ad production.
                            </p>
                        </div>

                        <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-4 hover:border-pink-500/30 transition-all">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Our Values</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Clarity, speed, and usable output. We want the tool to stay out of the way and help you ship creative faster.
                            </p>
                        </div>
                    </div>

                    {/* Story Section */}
                    <div className="space-y-8">
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black">The Story</h1>
                        <div className="prose prose-invert max-w-none text-zinc-400 space-y-6">
                            <p>
                                It started with a simple frustration: turning a handful of product or campaign images into a good video ad still takes too many tools and too much manual work.
                            </p>
                            <p>
                                Vadeo is being built around a narrower, more useful promise: upload images, generate motion, shape the result, and get to an ad-ready video faster.
                            </p>
                            <p>
                                This product is still being adapted, and the workflow will keep tightening as we tune it specifically for image-driven video advertising.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
