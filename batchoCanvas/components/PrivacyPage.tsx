import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

interface PrivacyPageProps {
    onStartEditing?: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onStartEditing }) => {

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
                    Privacy Policy
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Last updated: Nov 16, 2025
                </p>
            </section>

            {/* Content Section */}
            <section className="relative z-10 px-8 py-16 max-w-[1200px] mx-auto -mt-[50px]">
                <div className="bg-zinc-900/30 backdrop-blur border border-zinc-800/50 rounded-2xl p-8 md:p-12 text-zinc-300 leading-relaxed">

                    <div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-400 prose-li:text-zinc-400">
                        <h3 className="text-2xl font-bold mb-6 mt-0">1. Introduction</h3>
                        <p className="mb-6">
                            Batcho ("we," "our," or "us") provides AI-powered image enhancement tools that allow users to upload, improve, and download photos.
                            This Privacy Policy explains how we collect, use, and protect your information when you use Batcho.
                        </p>
                        <p className="mb-12">
                            By accessing or using Batcho, you agree to this Privacy Policy.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">2. Information We Collect</h3>

                        <h4 className="text-xl font-semibold mb-4 mt-8">2.1 Images You Upload</h4>
                        <p className="mb-4">
                            We collect the images you upload so they can be processed and enhanced.
                            Images may also be saved to your account if you choose to save them.
                        </p>

                        <h4 className="text-xl font-semibold mb-4 mt-8">2.2 Account Information</h4>
                        <p className="mb-4">
                            If you create an account, we may collect:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Your name</li>
                            <li>Email address</li>
                            <li>Password (encrypted)</li>
                            <li>Saved images associated with your account</li>
                        </ul>

                        <h4 className="text-xl font-semibold mb-4 mt-8">2.3 Usage Data</h4>
                        <p className="mb-4">
                            We may collect general, non-personally identifiable usage information for analytics and performance, such as:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Features accessed</li>
                            <li>Enhancement settings</li>
                            <li>Device type</li>
                            <li>Time spent on the platform</li>
                        </ul>
                        <p className="mb-12">
                            This data is used to improve the user experience and platform reliability.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">3. How We Use Your Information</h3>
                        <p className="mb-4">
                            Your data is used to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Process and enhance your images</li>
                            <li>Provide you with account features and saved images</li>
                            <li>Improve the functionality and performance of Batcho</li>
                            <li>Respond to support inquiries</li>
                            <li>Monitor the platform for security and performance</li>
                        </ul>
                        <p className="mb-4">
                            We do not:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>Sell your data</li>
                            <li>Use your images for advertising or marketing</li>
                            <li>Use your images to train external datasets</li>
                            <li>Share your images without your permission</li>
                        </ul>

                        <h3 className="text-2xl font-bold mb-6 mt-12">4. Image Storage & Retention</h3>
                        <ul className="list-disc pl-5 space-y-2 mb-12">
                            <li>Images uploaded for processing are stored temporarily for enhancement.</li>
                            <li>Images you choose to save will remain accessible in your dashboard until you delete them.</li>
                            <li>We may introduce features that automatically remove older images to help manage storage. You will be notified if such features become active.</li>
                        </ul>

                        <h3 className="text-2xl font-bold mb-6 mt-12">5. Data Protection & Security</h3>
                        <p className="mb-4">
                            We implement reasonable administrative, technical, and physical safeguards to protect your information, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Encrypted storage</li>
                            <li>Secure transmission of files</li>
                            <li>Access controls tied to your user account</li>
                        </ul>
                        <p className="mb-12">
                            Although we take data protection seriously, no system can guarantee absolute security.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">6. Service Providers</h3>
                        <p className="mb-6">
                            To operate Batcho, we use infrastructure and processing tools that may handle your images and prompts strictly for operational purposes.
                            These providers are contractually obligated to maintain confidentiality and adhere to privacy and data protection standards.
                        </p>
                        <p className="mb-12">
                            No additional personal information is shared beyond what is necessary for image processing and platform function.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">7. Your Rights</h3>
                        <p className="mb-4">
                            You may:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Access your saved images</li>
                            <li>Delete individual images</li>
                            <li>Delete your entire account</li>
                            <li>Request removal of all your data</li>
                            <li>Contact us for privacy-related questions</li>
                        </ul>
                        <p className="mb-12">
                            To request data deletion or account closure, contact us at <a href="mailto:support@batchocanvas.com" className="text-blue-400 hover:text-blue-300 transition-colors">support@batchocanvas.com</a>.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">8. Children's Privacy</h3>
                        <p className="mb-6">
                            Batcho is not intended for individuals under 13 years old.
                            We do not knowingly collect personal information from children.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">9. Changes to This Policy</h3>
                        <p className="mb-6">
                            We may update this Privacy Policy periodically.
                            When changes are made, we will update the "Last updated" date.
                        </p>
                        <p className="mb-12">
                            Continued use of Batcho after changes indicates acceptance of the revised policy.
                        </p>

                        <h3 className="text-2xl font-bold mb-6 mt-12">10. Contact Us</h3>
                        <p className="mb-6">
                            If you have questions about this Privacy Policy or how we handle data, please contact:
                            <br />
                            <a href="mailto:support@batchocanvas.com" className="text-blue-400 hover:text-blue-300 transition-colors">support@batchocanvas.com</a>
                        </p>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PrivacyPage;
