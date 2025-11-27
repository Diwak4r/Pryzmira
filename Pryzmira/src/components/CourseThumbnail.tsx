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
                    gradient: 'from-blue-600 to-cyan-400',
                    icon: Globe,
                    pattern: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 20%)'
                };
            case 'AI':
                return {
                    gradient: 'from-emerald-600 to-teal-400',
                    icon: BrainCircuit,
                    pattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 10px)'
                };
            case 'DSA':
                return {
                    gradient: 'from-teal-600 to-cyan-500',
                    icon: GitGraph,
                    pattern: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 40%)'
                };
            case 'System Design':
                return {
                    gradient: 'from-slate-700 to-indigo-500',
                    icon: Server,
                    pattern: 'linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
                };
            case 'Finance':
                return {
                    gradient: 'from-green-700 to-emerald-500',
                    icon: TrendingUp,
                    pattern: 'linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent)'
                };
            case 'Coding':
                return {
                    gradient: 'from-violet-600 to-fuchsia-400',
                    icon: Terminal,
                    pattern: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'
                };
            default:
                return {
                    gradient: 'from-gray-700 to-gray-500',
                    icon: Code2,
                    pattern: ''
                };
        }
    };

    const theme = getTheme(category);
    const Icon = theme.icon;

    return (
        <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} relative overflow-hidden ${className}`}>
            {/* Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: theme.pattern,
                    backgroundSize: category === 'System Design' ? '20px 20px' : category === 'Coding' ? '10px 10px' : '100% 100%'
                }}
            />

            {/* Large Background Icon */}
            <Icon
                className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 transform rotate-12"
                strokeWidth={1}
            />

            {/* Central Icon (Optional, maybe for specific courses) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                    <Icon className="w-8 h-8 text-white" />
                </div>
            </div>
        </div>
    );
}
