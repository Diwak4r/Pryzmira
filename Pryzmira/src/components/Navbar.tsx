import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Zap, Moon, Sun, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const navItems = [
    { name: 'Courses', path: '/' },
    { name: 'Creators', path: '/creators' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: 'Canvas', path: '/canvas' },
    { name: 'Resources', path: '/resources' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="p-2 bg-gradient-to-tr from-primary to-accent rounded-lg shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all duration-300">
                        <Zap className="w-5 h-5 text-white fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-text-primary group-hover:text-accent transition-colors">Pryzmira</span>
                </NavLink>

                {/* Search Bar (Desktop) */}
                <div className="hidden lg:flex items-center relative max-w-xs w-full mx-6 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="w-full bg-surface/50 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:bg-surface focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-text-secondary/50"
                    />
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-all duration-200 relative group ${isActive
                                    ? 'text-accent'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Right Actions */}
                <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/10">
                    <button
                        onClick={toggleTheme}
                        className="text-text-secondary hover:text-accent transition-colors p-2 rounded-full hover:bg-surface/50"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                        className="px-4 py-2 bg-text-primary text-background text-sm font-semibold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-text-primary p-1 hover:text-accent transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `text-lg font-medium transition-colors duration-200 ${isActive ? 'text-accent' : 'text-text-secondary'
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
