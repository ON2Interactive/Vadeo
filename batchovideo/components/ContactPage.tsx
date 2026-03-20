import React, { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { dbHelpers } from '../lib/supabase';
import { useRecaptcha } from '../hooks/useRecaptcha';
import Navigation from './Navigation';
import Footer from './Footer';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const { executeRecaptcha } = useRecaptcha();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = await executeRecaptcha('CONTACT');
        if (!token) {
            alert("Verification failed. Please try again.");
            return;
        }

        try {
            await dbHelpers.sendEmail({
                to: formData.email,
                subject: 'New Contact Form Submission',
                message: formData.message,
                type: 'contact',
                // token: token // Pass to backend if verification enabled
            });

            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Failed to send email:", error);
            alert("Failed to send message. Please try again.");
        }
    };

    return (
        <div className="w-full bg-black text-white min-h-screen font-['Inter'] flex flex-col">
            <Navigation />

            {/* Background Effects */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <main className="flex-grow pt-32 pb-24 px-8 relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-[24px] md:text-5xl lg:text-6xl font-bold tracking-tight">
                            Get in Touch
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-2xl p-8 space-y-6">
                                <h3 className="text-2xl font-bold">Contact Info</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Mail size={20} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">Email</p>
                                            <a href="mailto:support@batchovideo.com" className="text-lg hover:text-blue-400 transition-colors">
                                                support@batchovideo.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <MessageSquare size={20} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-zinc-400 mb-1">Social</p>
                                            <a href="https://twitter.com/batchovideo" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-purple-400 transition-colors">
                                                @batchovideo
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800 rounded-2xl p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-zinc-300">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-zinc-500"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-zinc-500"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium text-zinc-300">Message</label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder-zinc-500 resize-none"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitted}
                                    className="w-full bg-white text-black font-semibold rounded-lg px-6 py-3 hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitted ? (
                                        'Message Sent!'
                                    ) : (
                                        <>
                                            Send Message
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                            <p className="text-zinc-500 text-[11px] text-center mt-4">
                                This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy" className="underline hover:text-zinc-400">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="underline hover:text-zinc-400">Terms of Service</a> apply.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
