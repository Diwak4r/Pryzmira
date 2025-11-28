import {
    Code2,
    Terminal,
    Globe,
    TrendingUp,
    BrainCircuit,
    GitGraph,
    Server
} from 'lucide-react';

interface CourseThumbnailProps {
    category: string;
    className?: string;
}

export default function CourseThumbnail({ category, className = '' }: CourseThumbnailProps) {
    const getTheme = (cat: string) => {
        switch (cat) {
            case 'Web Dev':
                return {
                    icon: Globe,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    border: 'border-blue-200'
                };
            case 'AI':
                return {
                    icon: BrainCircuit,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-200'
                };
            case 'DSA':
                return {
                    icon: GitGraph,
                    color: 'text-teal-600',
                    bg: 'bg-teal-50',
                    border: 'border-teal-200'
                };
            case 'System Design':
                return {
                    icon: Server,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                    border: 'border-indigo-200'
                };
            case 'Finance':
                return {
                    icon: TrendingUp,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                    border: 'border-green-200'
                };
            case 'Coding':
                return {
                    icon: Terminal,
                    color: 'text-violet-600',
                    bg: 'bg-violet-50',
                    border: 'border-violet-200'
                };
            default:
                return {
                    icon: Code2,
                    color: 'text-gray-600',
                    bg: 'bg-gray-50',
                    border: 'border-gray-200'
                };
        }
    };

    const theme = getTheme(category);
    const Icon = theme.icon;

    return (
        <div className={`w-full h-full relative overflow-hidden bg-surface border ${theme.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-sm ${className}`}>
            {/* Minimalist Background Pattern */}
            <div className={`absolute inset-0 opacity-[0.03] ${theme.bg}`}
                style={{
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Central Icon Container */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-xl ${theme.bg} border ${theme.border} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-8 h-8 ${theme.color}`} strokeWidth={1.5} />
                </div>
            </div>

            {/* Corner Accent */}
            <div className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <Icon className={`w-12 h-12 ${theme.color} opacity-10 -rotate-12`} />
            </div>
        </div>
    );
}
