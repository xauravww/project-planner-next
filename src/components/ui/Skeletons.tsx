export function CardSkeleton() {
    return (
        <div className="animate-pulse space-y-4 p-6 rounded-lg bg-white/5 border border-white/10">
            <div className="h-6 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
        </div>
    );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function DetailSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-1/4"></div>
            </div>

            {/* Content sections */}
            <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-4/5"></div>
            </div>

            <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
            </div>
        </div>
    );
}
