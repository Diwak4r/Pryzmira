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
                <div className="mx-auto flex max-w-[960px] items-center justify-between px-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Pryzmira
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <a
                            href="https://github.com/Diwak4r"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground"
                        >
                            @Diwak4r
                        </a>
                        <span className="text-border">·</span>
                        <a
                            href="https://github.com/Diwak4r/Pryzmira"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground"
                        >
                            Source
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
