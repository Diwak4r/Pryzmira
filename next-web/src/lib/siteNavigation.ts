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
        title: 'Stay ahead of AI change with one weekly brief.',
        summary: 'Choose your AI goal and let Pryzmira turn it into a working weekly plan with a clearer next move.',
        focus: 'Home should convert anxiety and curiosity into a saved workspace.',
        shell: 'home',
        showNewsletter: true,
        showContextStrip: false,
    },
    '/categories': {
        href: '/categories',
        label: 'Atlas',
        shortLabel: 'Atlas',
        eyebrow: 'Course atlas',
        title: 'Browse the learning depth behind your workspace.',
        summary: 'Use the atlas when your brief points you toward a track worth going deeper on.',
        focus: 'Atlas is supporting inventory, not the main product loop.',
        shell: 'collection',
        showNewsletter: true,
        showContextStrip: true,
    },
    '/ai-tools': {
        href: '/ai-tools',
        label: 'Tools',
        shortLabel: 'Tools',
        eyebrow: 'Tool stack',
        title: 'Build the AI stack behind your weekly output.',
        summary: 'Use the tools directory to sharpen the workflows your workspace already prioritized.',
        focus: 'Tools should reduce decision time and increase execution speed.',
        shell: 'directory',
        showNewsletter: true,
        showContextStrip: true,
    },
    '/desk': {
        href: '/desk',
        label: 'Workspace',
        shortLabel: 'Workspace',
        eyebrow: 'Mission room',
        title: 'Your weekly AI edge, operating plan, and support stack.',
        summary: 'This is where Pryzmira should tell you what matters now, what to ignore, and what to do next.',
        focus: 'Workspace must feel like an operator console, not a saved-items tray.',
        shell: 'archive',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/resources': {
        href: '/resources',
        label: 'Library',
        shortLabel: 'Library',
        eyebrow: 'Reference library',
        title: 'Keep references, guides, and field notes within reach.',
        summary: 'Use the library as the recovery layer behind your AI workspace.',
        focus: 'References should support action, not distract from it.',
        shell: 'archive',
        showNewsletter: false,
        showContextStrip: true,
    },
    '/roadmap': {
        href: '/roadmap',
        label: 'Roadmap',
        shortLabel: 'Roadmap',
        eyebrow: 'Long-form path',
        title: 'See the larger progression behind the weekly brief.',
        summary: 'Roadmap gives structure when you need the full sequence, not just the next sprint.',
        focus: 'Roadmap should contextualize the workspace, not compete with it.',
        shell: 'roadmap',
        showNewsletter: true,
        showContextStrip: true,
    },
    '/canvas': {
        href: '/canvas',
        label: 'Studio',
        shortLabel: 'Studio',
        eyebrow: 'Practice studio',
        title: 'Turn ideas into sketches, systems, and visible output.',
        summary: 'Studio is where you turn AI plans into rough work and experiments.',
        focus: 'Practice should lead to artifacts, not just notes.',
        shell: 'practice',
        showNewsletter: false,
        showContextStrip: false,
    },
    '/course/[id]': {
        href: '/categories',
        label: 'Atlas',
        shortLabel: 'Atlas',
        eyebrow: 'Course brief',
        title: 'Evaluate the course, then return to the workspace with confidence.',
        summary: 'Course pages should help you decide quickly and get back to execution.',
        focus: 'Course detail is part of the atlas, not a detached route.',
        shell: 'detail',
        showNewsletter: false,
        showContextStrip: true,
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
