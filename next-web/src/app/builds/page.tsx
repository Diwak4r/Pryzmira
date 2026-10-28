import type { Metadata } from 'next';
import BuildsGallery from '@/views/BuildsGallery';
import { fetchBuildFeed } from '@/lib/builds/feed';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Builds made with AI models - Pryzmira',
    description:
        'A live gallery of what people are shipping with Claude, GPT, Gemini, Llama, and other AI models, pulled from X and GitHub plus hand-picked picks.',
};

export default async function BuildsPage() {
    // fetchBuildFeed never throws: unreachable sources fall back to curated picks.
    const feed = await fetchBuildFeed();

    return <BuildsGallery initialFeed={feed} />;
}
