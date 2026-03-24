import { emitPersonalDataUpdated } from '@/lib/personalDesk';

const RECENT_COURSES_KEY = 'pryzmira_recent_courses';
const RECENT_TOOLS_KEY = 'pryzmira_recent_tools';
const MAX_ITEMS = 6;

export interface RecentCourse {
    id: number;
    title: string;
    category: string;
    instructor: string;
    image?: string;
    viewedAt: string;
}

export interface RecentTool {
    id: string;
    name: string;
    category: string;
    url: string;
    viewedAt: string;
}

function canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readItems<T>(key: string): T[] {
    if (!canUseStorage()) {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeItems<T>(key: string, items: T[]): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.setItem(key, JSON.stringify(items));
    emitPersonalDataUpdated();
}

function upsertItem<T extends { id: string | number; viewedAt: string }>(
    current: T[],
    next: T
): T[] {
    const deduped = current.filter((item) => item.id !== next.id);
    return [next, ...deduped].slice(0, MAX_ITEMS);
}

export function getRecentCourses(): RecentCourse[] {
    return readItems<RecentCourse>(RECENT_COURSES_KEY);
}

export function saveRecentCourse(
    course: Omit<RecentCourse, 'viewedAt'>
): RecentCourse[] {
    const nextItem: RecentCourse = {
        ...course,
        viewedAt: new Date().toISOString(),
    };
    const nextItems = upsertItem(getRecentCourses(), nextItem);
    writeItems(RECENT_COURSES_KEY, nextItems);
    return nextItems;
}

export function getRecentTools(): RecentTool[] {
    return readItems<RecentTool>(RECENT_TOOLS_KEY);
}

export function saveRecentTool(tool: Omit<RecentTool, 'viewedAt'>): RecentTool[] {
    const nextItem: RecentTool = {
        ...tool,
        viewedAt: new Date().toISOString(),
    };
    const nextItems = upsertItem(getRecentTools(), nextItem);
    writeItems(RECENT_TOOLS_KEY, nextItems);
    return nextItems;
}
