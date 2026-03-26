import AIToolsClient from '@/components/AIToolsClient';
import {
    filterTools,
    getToolCategories,
    type ToolPricingFilter,
} from '@/lib/catalog';
import { getAITools } from '@/lib/content';

const validPricing: ToolPricingFilter[] = ['All', 'Free', 'Freemium', 'Paid'];

export default async function AIToolsPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string;
        cat?: string;
        price?: string;
        limit?: string;
    }>;
}) {
    const params = await searchParams;
    const tools = getAITools();
    const categories = getToolCategories(tools);
    const selectedCategory =
        params.cat && categories.includes(params.cat) ? params.cat : 'All';
    const pricingFilter = validPricing.includes(params.price as ToolPricingFilter)
        ? (params.price as ToolPricingFilter)
        : 'All';
    const limit = Math.min(Math.max(parseInt(params.limit || '12', 10) || 12, 12), 96);
    const query = (params.q || '').trim();
    const filteredTools = filterTools(tools, {
        query,
        selectedCategory,
        pricingFilter,
    });

    return (
        <AIToolsClient
            categories={categories}
            displayedTools={filteredTools.slice(0, limit)}
            featuredTools={tools.filter((tool) => tool.featured).slice(0, 4)}
            initialCategory={selectedCategory}
            initialPricing={pricingFilter}
            initialQuery={query}
            totalMatches={filteredTools.length}
            visibleCount={limit}
        />
    );
}
