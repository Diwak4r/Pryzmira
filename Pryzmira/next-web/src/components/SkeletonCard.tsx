export default function SkeletonCard() {
    return (
        <div className="h-full bg-surface border border-border rounded-2xl overflow-hidden animate-pulse flex flex-col">
            <div className="h-48 bg-white/5" />
            <div className="p-6 flex-grow space-y-4">
                <div className="h-6 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-16 bg-white/5 rounded w-full" />
                <div className="flex justify-between pt-4 mt-auto">
                    <div className="h-6 bg-white/5 rounded w-20" />
                    <div className="h-8 bg-white/5 rounded w-24" />
                </div>
            </div>
        </div>
    );
}
