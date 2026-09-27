import { notFound } from 'next/navigation';
import { getArtifactsByReleaseSlug, getReleaseBySlug } from '@/lib/data';
import ArtifactGridCard from '@/components/feed/ArtifactGridCard';
import { timeAgo } from '@/lib/time';

export default async function ReleasePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const release = await getReleaseBySlug(slug);
    if (!release) notFound();

    const artifacts = await getArtifactsByReleaseSlug(slug);

    return (
        <div className="wide-container pb-20 pt-8">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{release.company}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{release.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Released {timeAgo(release.releasedAt)} · {artifacts.length} build{artifacts.length === 1 ? '' : 's'} shared so
                far
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {artifacts.map((artifact) => (
                    <ArtifactGridCard key={artifact.id} artifact={artifact} />
                ))}
            </div>

            {artifacts.length === 0 && (
                <p className="mt-16 text-center text-sm text-muted-foreground">
                    No builds shared yet for {release.name}. Seen one? Submit it.
                </p>
            )}
        </div>
    );
}
