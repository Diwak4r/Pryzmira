'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
    { name: 'Categories', path: '/categories' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: 'Canvas', path: '/canvas' },
    { name: 'Resources', path: '/resources' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo - Minimal */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/logo.png"
                            alt="Pryzmira Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground font-heading">
                        Pryzmira
                    </span>
                </Link>

                {/* Desktop Nav - Simple Text Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path === '/categories' && pathname === '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`text-sm font-medium transition-colors relative group ${isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {item.name}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions - Functional Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                    >
                        {(theme || 'dark') === 'dark' ? (
                            <Moon className="w-4 h-4" />
                        ) : (
                            <Sun className="w-4 h-4" />
                        )}
                    </Button>

                    <Button asChild>
                        <Link href="/categories">
                            Get Started
                        </Link>
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col gap-6 mt-6">
                                {/* Mobile Nav Links */}
                                <div className="flex flex-col gap-2">
                                    {navItems.map((item) => {
                                        const isActive = pathname === item.path;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.path}
                                                onClick={() => setIsOpen(false)}
                                                className={`block px-4 py-3 text-base font-medium rounded-md transition-colors ${isActive
                                                    ? 'bg-accent text-accent-foreground'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                                    }`}
                                            >
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Mobile Actions */}
                                <div className="flex flex-col gap-3 pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        onClick={() => {
                                            toggleTheme();
                                            // Don't close menu on theme toggle
                                        }}
                                    >
                                        <span className="font-medium">Theme</span>
                                        {(theme || 'dark') === 'dark' ? (
                                            <Moon className="w-5 h-5" />
                                        ) : (
                                            <Sun className="w-5 h-5" />
                                        )}
                                    </Button>

                                    <Button asChild className="w-full">
                                        <Link
                                            href="/categories"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
