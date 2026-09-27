'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const NAV_LINKS = [
    { href: '/', label: 'Feed' },
    { href: '/explore', label: 'Explore' },
    { href: '/submit', label: 'Submit' },
    { href: '/about', label: 'About' },
];

export default function Navbar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex h-12 max-w-[960px] items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
                        Pryzmira
                    </Link>
                    <nav className="flex items-center gap-4">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`py-2 text-xs ${pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-1">
                    <a
                        href="https://github.com/Diwak4r/Pryzmira"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                        aria-label="GitHub"
                    >
                        <Github className="h-3.5 w-3.5" />
                    </a>
                    <button
                        onClick={toggleTheme}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    </button>
                </div>
            </div>
        </header>
    );
}
