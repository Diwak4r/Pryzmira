'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Hexagon, Moon, Sun, Search, Sparkles } from 'lucide-react';
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
    const [scrolled, setScrolled] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu  on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'glass-panel shadow-premium'
                    : 'bg-background/70 backdrop-blur-lg border-b border-border/30'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
                {/* Logo with Premium Effect */}
                <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="p-2 rounded-xl glass-card group-hover:gradient-bg transition-all duration-300"
                    >
                        <Hexagon className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-white transition-colors" />
                    </motion.div>
                    <span className="text-lg md:text-xl font-bold tracking-tight gradient-text font-heading">
                        Pryzmira
                    </span>
                </Link>

                {/* Search Bar (Desktop) - Premium Design */}
                <div className="hidden lg:flex items-center relative max-w-md w-full mx-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:gradient-text transition-all" />
                    <input
                        type="text"
                        placeholder="Search courses, tools, resources..."
                        className="w-full glass-card py-2.5 pl-11 pr-4 text-sm text-primary rounded-full focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all placeholder:text-text-secondary/50"
                    />
                </div>

                {/* Desktop Nav with Premium Style */}
                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path === '/categories' && pathname === '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-xl ${isActive
                                        ? 'text-primary'
                                        : 'text-text-secondary hover:text-primary'
                                    }`}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute inset-0 glass-card rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Right Actions - Premium Buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl glass-card hover:gradient-bg hover:text-white transition-all group"
                        aria-label="Toggle Theme"
                    >
                        {(theme || 'dark') === 'dark' ? (
                            <Moon className="w-4 h-4" />
                        ) : (
                            <Sun className="w-4 h-4" />
                        )}
                    </motion.button>

                    <Link
                        href="/categories"
                        className="px-5 py-2.5 gradient-bg text-white text-sm font-bold rounded-full hover:scale-105 transition-all shadow-premium flex items-center gap-2 group"
                    >
                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Get Started</span>
                    </Link>
                </div>

                {/* Mobile Menu Button - Enhanced */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="md:hidden p-2 rounded-xl glass-card text-primary hover:gradient-bg hover:text-white transition-all"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Menu"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="w-6 h-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Menu className="w-6 h-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Premium Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop with Blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-background/80 backdrop-blur-xl md:hidden"
                            style={{ top: '70px' }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="md:hidden glass-strong border-b border-border/50 shadow-2xl"
                        >
                            <div className="px-6 py-6 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto">
                                {/* Mobile Search */}
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full glass-card py-3 pl-11 pr-4 text-sm text-primary rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                                    />
                                </div>

                                {/* Mobile Nav Links */}
                                <div className="space-y-2">
                                    {navItems.map((item, index) => {
                                        const isActive = pathname === item.path;
                                        return (
                                            <motion.div
                                                key={item.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link
                                                    href={item.path}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`block px-5 py-4 text-lg font-semibold rounded-2xl transition-all ${isActive
                                                            ? 'gradient-bg text-white shadow-premium'
                                                            : 'text-text-secondary hover:text-primary glass-card hover:scale-[1.02]'
                                                        }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Mobile Actions */}
                                <div className="pt-4 space-y-3 border-t border-border/50">
                                    <button
                                        onClick={() => {
                                            toggleTheme();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between px-5 py-4 glass-card rounded-2xl text-primary hover:gradient-bg hover:text-white transition-all"
                                    >
                                        <span className="font-semibold">Toggle Theme</span>
                                        {(theme || 'dark') === 'dark' ? (
                                            <Moon className="w-5 h-5" />
                                        ) : (
                                            <Sun className="w-5 h-5" />
                                        )}
                                    </button>

                                    <Link
                                        href="/categories"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 px-5 py-4 gradient-bg text-white font-bold rounded-2xl shadow-premium hover:scale-[1.02] transition-all"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        <span>Get Started</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
