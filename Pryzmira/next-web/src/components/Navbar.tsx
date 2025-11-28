'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Hexagon, Moon, Sun, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

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
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="p-1.5 rounded-lg border border-border group-hover:border-accent/50 transition-colors duration-300">
                        <Hexagon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-primary group-hover:text-accent transition-colors font-heading">Pryzmira</span>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="hidden lg:flex items-center relative max-w-xs w-full mx-6 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-surface border border-border rounded-md py-1.5 pl-9 pr-4 text-sm text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-text-secondary/50"
                    />
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path === '/categories' && pathname === '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`text-sm font-medium transition-all duration-200 relative group ${isActive
                                    ? 'text-primary'
                                    : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-border">
                    <button
                        onClick={toggleTheme}
                        className="text-text-secondary hover:text-primary transition-colors p-2 rounded-md hover:bg-surface"
                        aria-label="Toggle Theme"
                    >
                        {(theme || 'dark') === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>

                    <Link
                        href="/categories"
                        className="px-4 py-1.5 bg-accent text-white text-sm font-bold rounded-full hover:bg-accent-hover transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-primary p-1 hover:text-accent transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b border-border overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`text-lg font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-secondary'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
