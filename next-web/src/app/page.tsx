import { Suspense } from 'react';
import VoiceHome from '@/views/VoiceHome';

function VoiceHomeSkeleton() {
    return (
        <div className="page-container pb-20 pt-8 md:pt-16">
            {/* Heading block */}
            <div className="mb-10">
                <div className="h-9 w-64 animate-pulse rounded-md bg-muted md:h-10" />
                <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded-md bg-muted" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-5">
                {/* Writing sample textarea (7 rows) */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="h-[11.5rem] w-full animate-pulse rounded-md bg-muted" />
                </div>

                {/* Writing task textarea (3 rows) */}
                <div>
                    <div className="mb-1.5 h-4 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-[5.25rem] w-full animate-pulse rounded-md bg-muted" />
                </div>

                {/* Extra instructions textarea (2 rows) */}
                <div>
                    <div className="mb-1.5 h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-[3.75rem] w-full animate-pulse rounded-md bg-muted" />
                </div>

                {/* Submit row */}
                <div className="flex items-center justify-between gap-4 pt-2">
                    <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                    <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={<VoiceHomeSkeleton />}>
            <VoiceHome />
        </Suspense>
    );
}
