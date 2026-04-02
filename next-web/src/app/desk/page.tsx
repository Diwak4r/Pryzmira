import { Suspense } from 'react';
import VoiceDesk from '@/views/VoiceDesk';

export const dynamic = 'force-dynamic';

function VoiceDeskSkeleton() {
    return (
        <div className="wide-container pb-20 pt-6 md:pt-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="mt-1 h-7 w-72 max-w-full animate-pulse rounded-md bg-muted md:h-8" />
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
                    <div className="h-8 w-12 animate-pulse rounded-md bg-muted" />
                </div>
            </div>

            {/* Voice analysis grid */}
            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-card px-3 py-2.5">
                        <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
                        <div className="mt-1 h-3.5 w-20 animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>

            {/* Insights toggle */}
            <div className="mt-3 h-9 w-full animate-pulse rounded-md bg-muted" />

            {/* Output card */}
            <div className="mt-6 rounded-md border border-border bg-card">
                <div className="border-b border-border px-4 py-2">
                    <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-2.5 px-4 py-5">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </div>
            </div>

            {/* Refine chips */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-28 animate-pulse rounded-md bg-muted" />
                ))}
            </div>

            {/* Custom refine row */}
            <div className="mt-2 flex gap-2">
                <div className="h-9 flex-1 animate-pulse rounded-md bg-muted" />
                <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
            </div>

            {/* Actions row */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
                <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
            </div>
        </div>
    );
}

export default function DeskPage() {
    return (
        <Suspense fallback={<VoiceDeskSkeleton />}>
            <VoiceDesk />
        </Suspense>
    );
}
