export interface SiteNavItem {
    href: string;
    label: string;
    shortLabel: string;
    eyebrow: string;
    title: string;
    summary: string;
    focus: string;
    shell: 'home' | 'desk';
}

const routeMeta: Record<string, SiteNavItem> = {
    '/': {
        href: '/',
        label: 'Home',
        shortLabel: 'Home',
        eyebrow: 'Voice intake',
        title: 'Write anything — exactly like you.',
        summary: 'Paste a real writing sample, describe what you need, and get output that sounds like you.',
        focus: 'Capture writing voice and generate in it.',
        shell: 'home',
    },
    '/desk': {
        href: '/desk',
        label: 'Desk',
        shortLabel: 'Desk',
        eyebrow: 'Voice desk',
        title: 'Your voice profile and generated output.',
        summary: 'View your voice analysis, generated text, and refine output until it sounds exactly right.',
        focus: 'Voice desk is the daily driver.',
        shell: 'desk',
    },
};

export const siteNavigation = [
    routeMeta['/'],
    routeMeta['/desk'],
];

export function normalizeRoute(pathname: string | null | undefined): string {
    if (!pathname || pathname === '') {
        return '/';
    }

    return pathname;
}

export function getRouteMeta(pathname: string | null | undefined): SiteNavItem {
    const normalized = normalizeRoute(pathname);
    return routeMeta[normalized] ?? routeMeta['/'];
}
