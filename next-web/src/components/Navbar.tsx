'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex h-12 max-w-[960px] items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
                        Pryzmira
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/"
                            className={`text-xs ${pathname === '/' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/desk"
                            className={`text-xs ${pathname === '/desk' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Desk
                        </Link>
                    </nav>
                </div>
                <button
                    onClick={toggleTheme}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </button>
            </div>
        </header>
    );
}
