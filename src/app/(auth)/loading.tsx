/**
 * Route-level skeleton for login/signup — mirrors the boxless Kinetic Orange
 * auth layout (back-link hint, centered subtitle, accent bar, field bars,
 * primary button bar) while the page/route is loading.
 */
export default function AuthLoading() {
    return (
        <div className="min-h-screen bg-white px-4 pt-16 pb-12 md:pt-24 md:pb-20 flex flex-col items-center">
            {/* back-link hint */}
            <div className="absolute left-4 top-4 md:left-8 md:top-6 h-3.5 w-24 bg-black/10 animate-pulse" />

            {/* centered heading/subtitle + accent */}
            <div className="mx-auto mt-4 h-8 w-48 bg-black/15 animate-pulse" />
            <div className="mx-auto mt-4 h-1 w-10 bg-[#FF4D00]/30" />

            {/* form field bars */}
            <div className="mt-10 w-full max-w-sm space-y-5">
                <div className="h-12 border-2 border-black/10 bg-black/5 animate-pulse" />
                <div className="h-12 border-2 border-black/10 bg-black/5 animate-pulse" />
                <div className="h-12 border-2 border-black/10 bg-black/5 animate-pulse" />
            </div>

            {/* primary button bar */}
            <div className="mt-6 w-full max-w-sm">
                <div className="h-12 bg-black/80 animate-pulse" />
            </div>
        </div>
    );
}
