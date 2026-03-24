'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof document !== 'undefined') {
            if (document.documentElement.classList.contains('dark')) {
                return 'dark';
            }

            if (document.documentElement.classList.contains('light')) {
                return 'light';
            }
        }

        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('theme');
                if (saved === 'dark' || saved === 'light') {
                    return saved;
                }
            } catch {
                return 'light';
            }
        }

        return 'light';
    });

    useEffect(() => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key !== 'theme') {
                return;
            }

            if (event.newValue === 'dark' || event.newValue === 'light') {
                setTheme(event.newValue);
            }
        }

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        try {
            localStorage.setItem('theme', theme);
        } catch {
            // Ignore storage write failures; the DOM class remains the source of truth.
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
