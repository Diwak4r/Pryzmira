'use client';

import Navbar from '@/components/Navbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="pt-12">
                {children}
            </main>
            <footer className="border-t border-border py-6">
                <div className="mx-auto max-w-[960px] px-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Pryzmira. Personal Writing Voice AI.
                    </p>
                </div>
            </footer>
        </div>
    );
}
