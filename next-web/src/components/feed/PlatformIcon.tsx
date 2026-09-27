import { Github, Link2, MessageSquare, Radio, Youtube, type LucideProps } from 'lucide-react';
import type { Platform } from '@/lib/types';

const ICONS: Record<Platform, typeof Radio> = {
    x: Radio,
    reddit: MessageSquare,
    youtube: Youtube,
    github: Github,
    article: Link2,
    other: Link2,
};

const LABELS: Record<Platform, string> = {
    x: 'X',
    reddit: 'Reddit',
    youtube: 'YouTube',
    github: 'GitHub',
    article: 'Article',
    other: 'Link',
};

export function platformLabel(platform: Platform): string {
    return LABELS[platform];
}

export default function PlatformIcon({ platform, ...props }: { platform: Platform } & LucideProps) {
    const Icon = ICONS[platform];
    return <Icon {...props} />;
}
