export default function BuildsLoading() {
    return (
        <div className="wide-container pb-20 pt-8 md:pt-12">
            <div className="border-b border-border pb-6">
                <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-8 w-72 max-w-full animate-pulse rounded-md bg-muted" />
                <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-3/4 max-w-xl animate-pulse rounded bg-muted" />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-6 w-28 animate-pulse rounded-md bg-muted" />
                ))}
            </div>

            <div className="mt-5 h-9 w-full animate-pulse rounded-md bg-muted" />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="rounded-md border border-border bg-card p-4">
                        <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
                        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="mt-2 space-y-1.5">
                            <div className="h-3 w-full animate-pulse rounded bg-muted" />
                            <div className="h-3 w-full animate-pulse rounded bg-muted" />
                            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="mt-4 flex gap-1">
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-14 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="mt-5 h-7 w-full animate-pulse rounded bg-muted" />
                    </div>
                ))}
            </div>
        </div>
    );
}
