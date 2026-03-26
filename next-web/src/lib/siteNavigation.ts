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
        label: 'Home',
        shortLabel: 'Home',
        eyebrow: 'Entry',
        title: 'Build the week, then run it from one place.',
        summary: 'Start one workspace, keep one brief active, and use the rest of the product as support material.',
        focus: 'Home should convert a goal into a saved workspace quickly.',
        shell: 'home',
        showNewsletter: true,
        showContextStrip: false,
    },
    '/categories': {
        href: '/categories',
        label: 'Atlas',
        shortLabel: 'Atlas',
        eyebrow: 'Course atlas',
        title: 'Open the learning depth behind the current week.',
        summary: 'The atlas is for deeper study after the workspace decides what matters.',
        focus: 'Atlas is support, not the primary product.',
        shell: 'collection',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/ai-tools': {
        href: '/ai-tools',
        label: 'Tools',
        shortLabel: 'Tools',
        eyebrow: 'Tool stack',
        title: 'Choose tools only when the brief needs them.',
        summary: 'Tool picks should shorten execution, not create more browsing.',
        focus: 'Tools are supporting infrastructure.',
        shell: 'directory',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/desk': {
        href: '/desk',
        label: 'Workspace',
        shortLabel: 'Workspace',
        eyebrow: 'Weekly desk',
        title: 'Run the current week from one focused workspace.',
        summary: 'The desk should show current focus, next actions, and only the support material needed to move.',
        focus: 'Workspace is the daily driver.',
        shell: 'archive',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/resources': {
        href: '/resources',
        label: 'Library',
        shortLabel: 'Library',
        eyebrow: 'Reference library',
        title: 'Keep references nearby without burying the main task.',
        summary: 'The library holds recovery material for active work.',
        focus: 'References should stay secondary.',
        shell: 'archive',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/roadmap': {
        href: '/roadmap',
        label: 'Roadmap',
        shortLabel: 'Roadmap',
        eyebrow: 'Long-form path',
        title: 'Use the roadmap when you need a longer arc.',
        summary: 'Roadmap exists for planning, not daily navigation.',
        focus: 'Roadmap is secondary to the desk.',
        shell: 'roadmap',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/canvas': {
        href: '/canvas',
        label: 'Studio',
        shortLabel: 'Studio',
        eyebrow: 'Practice studio',
        title: 'Use the studio for rough work when the week needs output.',
        summary: 'Studio is a side surface for experiments and drafts.',
        focus: 'Studio should not compete with the workspace.',
        shell: 'practice',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/course/[id]': {
        href: '/categories',
        label: 'Atlas',
        shortLabel: 'Atlas',
        eyebrow: 'Course brief',
        title: 'Inspect the course, then go back to the desk.',
        summary: 'Course detail should help the user decide and return to work.',
        focus: 'Course detail is part of the atlas, not a detached route.',
        shell: 'detail',
        showNewsletter: false,
        showContextStrip: false,
    },
};

export const siteNavigation = [
    routeMeta['/'],
    routeMeta['/desk'],
    routeMeta['/categories'],
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
