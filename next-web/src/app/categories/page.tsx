import Categories from '@/views/Categories';
import {
    filterCourses,
    getCourseCategories,
    getPopularCourses,
    type CourseSortOption,
    type ViewMode,
} from '@/lib/catalog';
import { getCourses } from '@/lib/content';

const validSorts: CourseSortOption[] = ['popular', 'rating', 'newest', 'duration'];
const validViews: ViewMode[] = ['grid', 'list'];

export default async function CategoriesPage({
    searchParams,
}: {
    searchParams: Promise<{
        cat?: string;
        q?: string;
        sort?: string;
        view?: string;
        limit?: string;
    }>;
}) {
    const params = await searchParams;
    const courses = getCourses();
    const categories = getCourseCategories(courses);
    const selectedCategory =
        params.cat && categories.includes(params.cat) ? params.cat : 'All';
    const sortBy = validSorts.includes(params.sort as CourseSortOption)
        ? (params.sort as CourseSortOption)
        : 'popular';
    const viewMode = validViews.includes(params.view as ViewMode)
        ? (params.view as ViewMode)
        : 'grid';
    const limit = Math.min(Math.max(parseInt(params.limit || '9', 10) || 9, 9), 60);
    const query = (params.q || '').trim();
    const filteredCourses = filterCourses(courses, {
        query,
        selectedCategory,
        sortBy,
    });

    return (
        <Categories
            categories={categories}
            displayedCourses={filteredCourses.slice(0, limit)}
            initialCategory={selectedCategory}
            initialQuery={query}
            popularCourses={getPopularCourses(courses)}
            sortBy={sortBy}
            totalMatches={filteredCourses.length}
            viewMode={viewMode}
            visibleCount={limit}
        />
    );
}
