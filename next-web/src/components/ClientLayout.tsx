'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar';
import Newsletter from './Newsletter';
import ExitIntentModal from './ExitIntentModal';
import { ArrowUp, ChevronRight, Home } from 'lucide-react';
import { useState, useEffect } from 'react';


export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const pathnames = pathname.split('/').filter((x) => x);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans selection:bg-primary/20 transition-colors duration-300">
            <ExitIntentModal />
            <Navbar />

            <main className="container mx-auto px-4 pt-24 pb-12">
                {/* Breadcrumbs */}
                {pathnames.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
                        <Link href="/" className="hover:text-text-primary transition-colors">
                            <Home className="w-4 h-4" />
                        </Link>
                        {pathnames.map((name, index) => {
                            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                            const isLast = index === pathnames.length - 1;
                            return (
                                <div key={name} className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4" />
                                    {isLast ? (
                                        <span className="text-text-primary capitalize">{name.replace('-', ' ')}</span>
                                    ) : (
                                        <Link href={routeTo} className="hover:text-text-primary transition-colors capitalize">
                                            {name.replace('-', ' ')}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {children}
            </main>

            <Newsletter />

            <footer className="border-t border-border py-8 mt-12 transition-colors duration-300">
                <div className="container mx-auto px-4 text-center text-text-secondary text-sm">
                    <p>&copy; {new Date().getFullYear()} Pryzmira. All rights reserved.</p>
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/10 transition-all duration-300 z-50 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </div>
    );
}
