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
                            About BatchoCanvas
                        </h1>
                        <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            We're on a mission to democratize professional video creation.
                            Powerful tools shouldn't require a steep learning curve.
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
                                To build the most intuitive layer-based video editor that allows anyone to create studio-quality content in minutes, not hours.
                            </p>
                        </div>

                        <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-4 hover:border-purple-500/30 transition-all">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Who We Are</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                A team of creators, developers, and designers who were tired of clunky software. We built the tool we always wanted to use.
                            </p>
                        </div>

                        <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-4 hover:border-pink-500/30 transition-all">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400">
                                <Heart size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Our Values</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Simplicity, performance, and creative freedom. We believe technology should get out of the way of your creativity.
                            </p>
                        </div>
                    </div>

                    {/* Story Section */}
                    <div className="space-y-8">
                        <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black">The Story</h1>
                        <div className="prose prose-invert max-w-none text-zinc-400 space-y-6">
                            <p>
                                It started with a simple frustration: why does editing a simple video for social media require software designed for Hollywood blockbusters?
                            </p>
                            <p>
                                BatchoCanvas was born from the idea that video editing should be as easy as designing a slide deck. We stripped away the unnecessary complexity and focused on what modern creators actually need: a flexible canvas, intuitive layering, and fast rendering.
                            </p>
                            <p>
                                Today, thousands of creators use BatchoCanvas to tell their stories, market their products, and share their knowledge with the world. And we're just getting started.
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
