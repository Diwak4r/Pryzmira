import Categories from '@/views/Categories';

export default async function CategoriesPage({
    searchParams,
}: {
    searchParams: Promise<{ cat?: string }>;
}) {
    const params = await searchParams;
    return <Categories key={params.cat ?? 'All'} initialCategory={params.cat} />;
}
