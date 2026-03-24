export interface SiteNavItem {
    href: string;
    label: string;
    shortLabel: string;
    eyebrow: string;
    title: string;
    summary: string;
    focus: string;
    shell: 'home' | 'collection' | 'directory' | 'roadmap' | 'archive' | 'practice' | 'detail';
    showNewsletter?: boolean;
    showContextStrip?: boolean;
}

const routeMeta: Record<string, SiteNavItem> = {
    '/': {
        href: '/',
        label: 'Atlas',
        shortLabel: 'Atlas',
        eyebrow: 'Front door',
        title: 'A calmer front door into technical learning.',
        summary:
            'Use the landing page to orient yourself, then enter the atlas, tools, roadmap, or archive with a clear sense of what each area is for.',
        focus: 'The home route should explain Pryzmira before sending someone into deeper flows.',
        shell: 'home',
        showNewsletter: true,
        showContextStrip: false,
    },
    '/categories': {
        href: '/categories',
        label: 'Atlas',
        shortLabel: 'Atlas',
        eyebrow: 'Curated atlas',
        title: 'A calmer map through modern technical learning.',
        summary:
            'Browse the course index, resume where you left off, and move into focused tracks without getting lost in noise.',
        focus: 'Discovery is organized around the next useful step, not infinite browsing.',
        shell: 'collection',
        showNewsletter: true,
        showContextStrip: true,
    },
    '/ai-tools': {
        href: '/ai-tools',
        label: 'Tools',
        shortLabel: 'Tools',
        eyebrow: 'Tool directory',
        title: 'Useful AI tooling, filtered through actual judgment.',
        summary:
            'Compare curated tools, scan pricing and categories, and pull live search context without leaving the product.',
        focus: 'The goal is faster judgment and less time wasted on novelty.',
        shell: 'directory',
        showNewsletter: true,
        showContextStrip: true,
    },
    '/desk': {
        href: '/desk',
        label: 'Desk',
        shortLabel: 'Desk',
        eyebrow: 'Personal desk',
        title: 'Saved courses, tools, and resources in one private working surface.',
        summary:
            'The desk is the personal layer of Pryzmira where saved items stay organized and ready to reopen.',
        focus: 'This route should feel like a working tray, not a public browse page.',
        shell: 'archive',
        showNewsletter: false,
        showContextStrip: true,
    },
    '/resources': {
        href: '/resources',
        label: 'Resources',
        shortLabel: 'Resources',
        eyebrow: 'Private archive',
        title: 'Field notes, references, and compact study material.',
        summary:
            'Access the archive, search across tabs, and keep supporting material organized like a real working collection.',
        focus: 'Everything here is arranged for study sessions, not vanity metrics.',
        shell: 'archive',
        showNewsletter: false,
        showContextStrip: true,
    },
    '/roadmap': {
        href: '/roadmap',
        label: 'Roadmap',
        shortLabel: 'Roadmap',
        eyebrow: 'Learning route',
        title: 'A sequenced path from basics to production engineering.',
        summary:
            'Follow a staged route with clear status, topic clusters, and direct links back into the catalog.',
        focus: 'Consistency matters more than trend chasing or arbitrary checklists.',
        shell: 'roadmap',
        showNewsletter: true,
        showContextStrip: true,
    },
    '/canvas': {
        href: '/canvas',
        label: 'Canvas',
        shortLabel: 'Canvas',
        eyebrow: 'Practice space',
        title: 'A place to turn ideas into hands-on reps.',
        summary:
            'Practice with prompts and challenges that connect the catalog to actual execution.',
        focus: 'Momentum should convert into output, not just reading.',
        shell: 'practice',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/course/[id]': {
        href: '/categories',
        label: 'Course',
        shortLabel: 'Course',
        eyebrow: 'Course brief',
        title: 'A closer look at the course, the fit, and the next move.',
        summary:
            'Review benefits, prerequisites, related options, and action paths without losing the thread of the broader atlas.',
        focus: 'Each detail page should help a learner decide with confidence.',
        shell: 'detail',
        showNewsletter: false,
        showContextStrip: true,
    },
};

export const siteNavigation = [
    routeMeta['/categories'],
    routeMeta['/desk'],
    routeMeta['/ai-tools'],
    routeMeta['/resources'],
    routeMeta['/roadmap'],
    routeMeta['/canvas'],
];

export function normalizeRoute(pathname: string | null | undefined): string {
    if (!pathname || pathname === '') {
        return '/';
    }

    if (pathname.startsWith('/course/')) {
        return '/course/[id]';
    }

    return pathname;
}

export function getRouteMeta(pathname: string | null | undefined): SiteNavItem {
    const normalized = normalizeRoute(pathname);
    return routeMeta[normalized] ?? routeMeta['/categories'];
}
