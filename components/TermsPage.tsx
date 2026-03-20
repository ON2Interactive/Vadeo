import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface TermsPageProps {
    onStartEditing?: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onStartEditing }) => {

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
                    Terms of Use
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Last updated: Nov 16, 2025
                </p>
            </section>

            {/* Content Section */}
            <section className="relative z-10 px-8 py-16 max-w-[1200px] mx-auto -mt-[50px]">
                <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 md:p-12 text-zinc-300 leading-relaxed">

                    <div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-400 prose-li:text-zinc-400">
                        <h3 className="text-2xl font-bold mb-6 mt-0">1. Acceptance of Terms</h3>
                        <p className="mb-6">
                            By accessing or using Vadeo ("the Service"), you agree to be bound by these Terms of Use ("Terms").
                            If you do not agree, do not use the Service.
                        </p>
                        <p className="mb-12">
                            Vadeo reserves the right to update or modify these Terms at any time.
                            Your continued use of the Service constitutes acceptance of any changes.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">2. Description of Service</h3>
                        <p className="mb-6">
                            Vadeo is an online workspace that allows users to upload images and video, design ad scenes, generate video outputs with AI-powered tools, and export or save the results.
                        </p>
                        <p className="mb-12">
                            We may update, improve, or discontinue parts of the Service at any time.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">3. User Accounts</h3>
                        <h4 className="text-xl font-semibold mb-4 mt-8">3.1 Registration</h4>
                        <p className="mb-6">
                            To access certain features, you may need to create an account.
                            You agree to provide accurate information and maintain the security of your login credentials.
                        </p>

                        <h4 className="text-xl font-semibold mb-4 mt-8">3.2 Responsibility for Your Account</h4>
                        <p className="mb-6">
                            You are responsible for all activity occurring under your account.
                            If you suspect unauthorized access, you must notify us immediately.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">4. User Content</h3>
                        <h4 className="text-xl font-semibold mb-4 mt-8">4.1 Ownership</h4>
                        <p className="mb-6">
                            You retain all rights to the images and content you upload ("User Content").
                            Vadeo does not claim ownership over your uploaded or generated content.
                        </p>

                        <h4 className="text-xl font-semibold mb-4 mt-8">4.2 License to Process Your Content</h4>
                        <p className="mb-4">
                            By uploading content to Vadeo, you grant us a limited license to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Process your uploaded images and video</li>
                            <li>Generate derived outputs requested by you</li>
                            <li>Store content temporarily or as part of your saved projects</li>
                            <li>Display them to you within your account</li>
                        </ul>
                        <p className="mb-4">
                            We do not use your content for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>Marketing</li>
                            <li>Advertising</li>
                            <li>Public display</li>
                            <li>AI training datasets</li>
                        </ul>

                        <h4 className="text-xl font-semibold mb-4 mt-8">4.3 Responsibility</h4>
                        <p className="mb-4">
                            You are solely responsible for the content you upload.
                            You agree not to upload content that:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Violates intellectual property rights</li>
                            <li>Contains harmful, illegal, or abusive material</li>
                            <li>Infringes privacy or publicity rights</li>
                            <li>Contains sensitive personal data (e.g., passports, IDs)</li>
                        </ul>
                        <p className="mb-12">
                            Vadeo reserves the right to remove content that violates these Terms.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">5. Permitted Use</h3>
                        <p className="mb-4">
                            You agree to use the Service only for lawful purposes.
                            You may not:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>Attempt to reverse engineer or misuse the platform</li>
                            <li>Interfere with or disrupt the Service</li>
                            <li>Upload malicious files or code</li>
                            <li>Use the Service to create harmful, misleading, or deceptive content</li>
                            <li>Use automated scripts, scrapers, or bots without permission</li>
                        </ul>

                        <h3 className="text-2xl font-bold mb-6 mt-12">6. Image Retention</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Uploaded media may be stored temporarily for processing and generation.</li>
                            <li>Saved projects and outputs remain in your account until you delete them, subject to plan limits and storage policies.</li>
                            <li>We may provide tools to automatically remove older files to manage storage.</li>
                        </ul>
                        <p className="mb-12">
                            Vadeo is not a long-term file storage service; always keep your own backups.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">7. Service Availability</h3>
                        <p className="mb-6">
                            We strive to maintain uptime and reliability but do not guarantee uninterrupted access.
                            Vadeo is provided on an "as-is" and "as-available" basis.
                        </p>
                        <p className="mb-12">
                            We may suspend or throttle certain features for maintenance, compliance, or performance reasons.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">8. Fees & Payments</h3>
                        <p className="mb-6">
                            If Vadeo offers paid plans or subscriptions, all fees will be clearly stated.
                            By subscribing or making a purchase, you agree to the posted pricing and billing terms.
                        </p>
                        <p className="mb-12">
                            We may update pricing with reasonable notice when applicable.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">9. Termination</h3>
                        <p className="mb-4">
                            We reserve the right to suspend or terminate accounts that:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Violate these Terms</li>
                            <li>Attempt to misuse the platform</li>
                            <li>Engage in illegal or fraudulent behavior</li>
                            <li>Upload harmful or prohibited content</li>
                        </ul>
                        <p className="mb-4">
                            You may delete your account at any time.
                        </p>
                        <p className="mb-12">
                            Upon termination, your access to the Service and saved images may be removed.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">10. Disclaimer of Warranties</h3>
                        <p className="mb-4">
                            Vadeo makes no warranties, express or implied, regarding the Service, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Accuracy of generated or edited outputs</li>
                            <li>Fitness for a particular purpose</li>
                            <li>Availability or performance</li>
                            <li>Non-infringement</li>
                        </ul>
                        <p className="mb-12">
                            Use the Service at your own risk.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">11. Limitation of Liability</h3>
                        <p className="mb-4">
                            To the fullest extent permitted by law, Vadeo is not liable for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Loss of data</li>
                            <li>Service interruptions</li>
                            <li>Inaccurate output or media transformations</li>
                            <li>Unauthorized access to your account</li>
                            <li>Any indirect, incidental, or consequential damages</li>
                        </ul>
                        <p className="mb-12">
                            Your sole remedy for dissatisfaction is to stop using the Service.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">12. Indemnification</h3>
                        <p className="mb-4">
                            You agree to indemnify and hold Vadeo harmless from any claims arising from:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>Your uploaded content</li>
                            <li>Your misuse of the Service</li>
                            <li>Your violation of these Terms</li>
                            <li>Your violation of any laws or third-party rights</li>
                        </ul>

                        <h3 className="text-2xl font-bold mb-6 mt-12">13. Governing Law</h3>
                        <p className="mb-12">
                            These Terms are governed by and interpreted according to the laws of your jurisdiction of residence, unless otherwise required by applicable law.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">14. Contact Us</h3>
                        <p className="mb-6">
                            If you have questions about these Terms, please contact us at:
                            <br />
                            <a href="mailto:hello@vadeo.cloud" className="text-blue-400 hover:text-blue-300 transition-colors">hello@vadeo.cloud</a>
                        </p>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default TermsPage;
