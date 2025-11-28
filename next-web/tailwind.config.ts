import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                surface: "var(--surface)",
                "surface-hover": "var(--surface-hover)",
                border: "var(--border)",
                primary: "var(--primary)",
                "primary-foreground": "var(--primary-foreground)",
                accent: "var(--accent)",
                "accent-foreground": "var(--accent-foreground)",
                "accent-hover": "var(--accent-hover)",
                "accent-secondary": "var(--accent-secondary)",
                secondary: "var(--secondary)",
                gold: "var(--gold)",
                "text-primary": "var(--text-primary)",
                "text-secondary": "var(--text-secondary)",
            },
            fontFamily: {
                sans: ["var(--font-jakarta)", "sans-serif"],
                heading: ["var(--font-syne)", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
