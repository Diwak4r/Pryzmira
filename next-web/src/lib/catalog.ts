export type CourseSortOption = 'popular' | 'rating' | 'newest' | 'duration';
export type ToolPricingFilter = 'All' | 'Free' | 'Freemium' | 'Paid';
export type ViewMode = 'grid' | 'list';

export interface CourseRecord {
    id: number;
    title: string;
    instructor: string;
    category: string;
    description: string;
    difficulty: string;
    duration: string;
    image?: string;
    rating?: number;
    students?: number;
    tags?: string[];
    url: string;
    instructor_lang?: string;
    type?: string;
    benefits?: string[];
    prerequisites?: string[];
}

export interface ToolRecord {
    id: string;
    name: string;
    category: string;
    description: string;
    url: string;
    tags: string[];
    pricing: 'Free' | 'Freemium' | 'Paid';
    image: string;
    featured?: boolean;
    affiliateUrl?: string;
}

export const categoryLabels: Record<string, string> = {
    'Web Dev': 'Web development',
    DSA: 'Algorithms and DSA',
    'System Design': 'System design',
    'Mobile Dev': 'Mobile apps',
    DevOps: 'DevOps',
    Cloud: 'Cloud',
    'Game Dev': 'Game development',
    Finance: 'Finance and business',
    Coding: 'Core coding',
    AI: 'AI and ML',
    'Data Science': 'Data science',
    Cybersecurity: 'Cybersecurity',
    Blockchain: 'Blockchain',
    'UI/UX': 'UI and UX',
};

export function getCourseCategories(courses: CourseRecord[]): string[] {
    return ['All', ...Object.keys(categoryLabels)].filter((category, index, values) => {
        if (category === 'All') {
            return true;
        }

        return values.indexOf(category) === index && courses.some((course) => course.category === category);
    });
}

export function filterCourses(
    courses: CourseRecord[],
    options: {
        query: string;
        selectedCategory: string;
        sortBy: CourseSortOption;
    }
): CourseRecord[] {
    const query = options.query.toLowerCase().trim();
    const terms = query.split(/\s+/).filter(Boolean);

    const result = courses.filter((course) => {
        const matchesCategory =
            options.selectedCategory === 'All' || course.category === options.selectedCategory;

        const matchesSearch =
            terms.length === 0 ||
            terms.every((term) =>
                [
                    course.title,
                    course.instructor,
                    course.category,
                    course.description,
                    ...(course.tags || []),
                ].some((field) => field.toLowerCase().includes(term))
            );

        return matchesCategory && matchesSearch;
    });

    return [...result].sort((left, right) => {
        switch (options.sortBy) {
            case 'rating':
                return (right.rating || 0) - (left.rating || 0);
            case 'newest':
                return right.id - left.id;
            case 'duration':
                return parseInt(right.duration, 10) - parseInt(left.duration, 10);
            case 'popular':
            default:
                return (right.students || 0) - (left.students || 0);
        }
    });
}

export function getPopularCourses(courses: CourseRecord[], count = 3): CourseRecord[] {
    return [...courses]
        .sort((left, right) => (right.students || 0) - (left.students || 0))
        .slice(0, count);
}

export function getToolCategories(tools: ToolRecord[]): string[] {
    return ['All', ...Array.from(new Set(tools.map((tool) => tool.category))).sort()];
}

export function filterTools(
    tools: ToolRecord[],
    options: {
        query: string;
        selectedCategory: string;
        pricingFilter: ToolPricingFilter;
    }
): ToolRecord[] {
    const query = options.query.toLowerCase().trim();

    return tools.filter((tool) => {
        const matchesSearch =
            query.length === 0 ||
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query) ||
            tool.tags.some((tag) => tag.toLowerCase().includes(query));

        const matchesCategory =
            options.selectedCategory === 'All' || tool.category === options.selectedCategory;
        const matchesPricing =
            options.pricingFilter === 'All' || tool.pricing === options.pricingFilter;

        return matchesSearch && matchesCategory && matchesPricing;
    });
}
