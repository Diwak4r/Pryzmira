const SAVED_COURSES_KEY = 'pryzmira_saved_courses';
const SAVED_TOOLS_KEY = 'pryzmira_saved_tools';
const SAVED_RESOURCES_KEY = 'pryzmira_saved_resources';
const PERSONAL_DATA_UPDATED_EVENT = 'pryzmira:personal-data-updated';
const MAX_SAVED_ITEMS = 12;

export interface SavedCourse {
    id: number;
    title: string;
    category: string;
    instructor: string;
    image?: string;
    savedAt: string;
}

export interface SavedTool {
    id: string;
    name: string;
    category: string;
    url: string;
    description: string;
    pricing: string;
    savedAt: string;
}

export interface SavedResource {
    id: string;
    title: string;
    type: string;
    link: string;
    description: string;
    savedAt: string;
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

function upsertItem<T extends { id: string | number; savedAt: string }>(
    current: T[],
    next: T
): T[] {
    const deduped = current.filter((item) => item.id !== next.id);
    return [next, ...deduped].slice(0, MAX_SAVED_ITEMS);
}

export function emitPersonalDataUpdated(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(PERSONAL_DATA_UPDATED_EVENT));
}

export function subscribeToPersonalDataUpdates(callback: () => void): () => void {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const handleStorage = () => callback();
    const handleCustom = () => callback();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PERSONAL_DATA_UPDATED_EVENT, handleCustom as EventListener);

    return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener(PERSONAL_DATA_UPDATED_EVENT, handleCustom as EventListener);
    };
}

export function getSavedCourses(): SavedCourse[] {
    return readItems<SavedCourse>(SAVED_COURSES_KEY);
}

export function isCourseSaved(id: number): boolean {
    return getSavedCourses().some((course) => course.id === id);
}

export function toggleSavedCourse(course: Omit<SavedCourse, 'savedAt'>): SavedCourse[] {
    const current = getSavedCourses();

    if (current.some((item) => item.id === course.id)) {
        const nextItems = current.filter((item) => item.id !== course.id);
        writeItems(SAVED_COURSES_KEY, nextItems);
        return nextItems;
    }

    const nextItem: SavedCourse = {
        ...course,
        savedAt: new Date().toISOString(),
    };
    const nextItems = upsertItem(current, nextItem);
    writeItems(SAVED_COURSES_KEY, nextItems);
    return nextItems;
}

export function removeSavedCourse(id: number): SavedCourse[] {
    const nextItems = getSavedCourses().filter((item) => item.id !== id);
    writeItems(SAVED_COURSES_KEY, nextItems);
    return nextItems;
}

export function getSavedTools(): SavedTool[] {
    return readItems<SavedTool>(SAVED_TOOLS_KEY);
}

export function isToolSaved(id: string): boolean {
    return getSavedTools().some((tool) => tool.id === id);
}

export function toggleSavedTool(tool: Omit<SavedTool, 'savedAt'>): SavedTool[] {
    const current = getSavedTools();

    if (current.some((item) => item.id === tool.id)) {
        const nextItems = current.filter((item) => item.id !== tool.id);
        writeItems(SAVED_TOOLS_KEY, nextItems);
        return nextItems;
    }

    const nextItem: SavedTool = {
        ...tool,
        savedAt: new Date().toISOString(),
    };
    const nextItems = upsertItem(current, nextItem);
    writeItems(SAVED_TOOLS_KEY, nextItems);
    return nextItems;
}

export function removeSavedTool(id: string): SavedTool[] {
    const nextItems = getSavedTools().filter((item) => item.id !== id);
    writeItems(SAVED_TOOLS_KEY, nextItems);
    return nextItems;
}

export function getSavedResources(): SavedResource[] {
    return readItems<SavedResource>(SAVED_RESOURCES_KEY);
}

export function isResourceSaved(id: string): boolean {
    return getSavedResources().some((resource) => resource.id === id);
}

export function toggleSavedResource(
    resource: Omit<SavedResource, 'savedAt'>
): SavedResource[] {
    const current = getSavedResources();

    if (current.some((item) => item.id === resource.id)) {
        const nextItems = current.filter((item) => item.id !== resource.id);
        writeItems(SAVED_RESOURCES_KEY, nextItems);
        return nextItems;
    }

    const nextItem: SavedResource = {
        ...resource,
        savedAt: new Date().toISOString(),
    };
    const nextItems = upsertItem(current, nextItem);
    writeItems(SAVED_RESOURCES_KEY, nextItems);
    return nextItems;
}

export function removeSavedResource(id: string): SavedResource[] {
    const nextItems = getSavedResources().filter((item) => item.id !== id);
    writeItems(SAVED_RESOURCES_KEY, nextItems);
    return nextItems;
}
