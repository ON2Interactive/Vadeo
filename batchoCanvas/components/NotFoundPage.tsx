import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const NotFoundPage: React.FC = () => {
    React.useEffect(() => {
        document.title = "404";
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="w-full bg-black text-white min-h-screen font-['Inter'] flex flex-col">
            {/* Subtle Grid Pattern Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

            {/* Blue Glow Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <Navigation />

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-8 text-center mt-[-100px]">
                <h1 className="text-[36px] max-[480px]:text-[18px] max-[480px]:leading-[1.2] font-black tracking-tight leading-none">
                    404
                </h1>
                <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mt-4">
                    Oops, this page does not exist.
                </p>
                <div className="mt-12">
                    <a
                        href="/"
                        className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-all active:scale-95"
                    >
                        Return Home
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NotFoundPage;
