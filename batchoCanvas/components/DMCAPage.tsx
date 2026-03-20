import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface DMCAPageProps {
    onStartEditing?: () => void;
}

const DMCAPage: React.FC<DMCAPageProps> = ({ onStartEditing }) => {

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
            <section className="relative z-10 px-8 py-[100px] min-h-[400px] flex flex-col items-center justify-center max-w-[1400px] mx-auto text-center">
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black mb-6">
                    DMCA Notice
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Last updated: Nov 16, 2025
                </p>
            </section>

            {/* Content Section */}
            <section className="relative z-10 px-8 py-16 max-w-[1200px] mx-auto -mt-[50px]">
                <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 md:p-12 text-zinc-300 leading-relaxed">

                    <div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-400 prose-li:text-zinc-400">
                        <p className="mb-6">
                            Batcho respects the intellectual property rights of others and expects all users to do the same.
                            If you believe that content uploaded or processed through Batcho infringes your copyright, you may submit a formal DMCA Takedown Notice.
                        </p>
                        <p className="mb-12">
                            We will review all notices and respond according to applicable laws.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">1. Reporting Copyright Infringement</h3>
                        <p className="mb-6">
                            If you believe material on Batcho infringes your copyright, please send a written DMCA notice containing the following information:
                        </p>
                        <ol className="list-decimal pl-5 space-y-4 mb-4">
                            <li>
                                <strong>Identification of the copyrighted work you claim has been infringed.</strong>
                                <br />
                                (If multiple works are involved, you may provide a representative list.)
                            </li>
                            <li>
                                <strong>Identification of the specific content you believe is infringing.</strong>
                                <br />
                                Include image URLs, descriptions, or account identifiers so we can locate the material.
                            </li>
                            <li>
                                A statement that you have a good-faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.
                            </li>
                            <li>
                                A statement, under penalty of perjury, that the information provided is accurate and that you are the copyright owner or authorized to act on behalf of the owner.
                            </li>
                            <li>
                                <strong>Your contact information, including:</strong>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Full name</li>
                                    <li>Email address</li>
                                    <li>Phone number (optional)</li>
                                    <li>Mailing address (optional)</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Your physical or electronic signature.</strong>
                            </li>
                        </ol>

                        <h3 className="text-2xl font-bold mb-6 mt-12">2. Submitting Your Notice</h3>
                        <p className="mb-6">
                            Please send DMCA notices to:
                        </p>
                        <p className="mb-6">
                            <a href="mailto:support@batchocanvas.com" className="text-blue-400 hover:text-blue-300 transition-colors">support@batchocanvas.com</a>
                        </p>
                        <p className="mb-12">
                            We may request additional information if necessary to confirm the claim.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">3. What Happens Next</h3>
                        <p className="mb-4">
                            After receiving a proper DMCA notice:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>We will review the claim.</li>
                            <li>If the content appears to infringe, we may remove or disable access to it.</li>
                            <li>We may notify the user responsible for the content so they can respond.</li>
                            <li>We may terminate accounts of repeat infringers, when appropriate.</li>
                        </ul>

                        <h3 className="text-2xl font-bold mb-6 mt-12">4. Counter-Notification Process</h3>
                        <p className="mb-6">
                            If you believe your content was removed by mistake or misidentification, you may submit a DMCA counter-notification.
                        </p>
                        <p className="mb-4">
                            Your counter-notification must include:
                        </p>
                        <ol className="list-decimal pl-5 space-y-4 mb-6">
                            <li>Identification of the content that was removed or disabled.</li>
                            <li>A statement, under penalty of perjury, that you have a good-faith belief the removal was a mistake or the content was misidentified.</li>
                            <li>Your name, contact information, and consent to the jurisdiction of your local courts for dispute resolution.</li>
                            <li>Your physical or electronic signature.</li>
                        </ol>
                        <p className="mb-12">
                            After receiving a valid counter-notification, we may restore the content unless the copyright owner initiates legal action within the required timeframe.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">5. Repeat Infringers</h3>
                        <p className="mb-12">
                            Batcho may suspend or terminate accounts of users who repeatedly upload infringing content.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">6. No Legal Advice</h3>
                        <p className="mb-6">
                            This DMCA section is provided for informational purposes only and is not legal advice.
                            If you are unsure whether your content is infringing, you should seek legal guidance.
                        </p>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default DMCAPage;
