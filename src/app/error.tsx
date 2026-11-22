"use client";

import { NebulaButton } from "@/components/ui/NebulaButton";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
            <p className="font-mono text-xs uppercase tracking-tight text-[#FF4D00]">Unexpected error</p>
            <h1 className="type-display mt-4 text-[length:clamp(2.5rem,10vw,8rem)]">
                Something went wrong
            </h1>
            <div className="mx-auto mt-4 h-1 w-10 bg-[#FF4D00]" />
            <p className="mt-5 max-w-md text-black/70">
                An unexpected error occurred. Try again, or head back home.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={reset}
                    className="nebula-btn nebula-btn--primary"
                >
                    Try again
                </button>
                <NebulaButton href="/" variant="ghost" size="lg">
                    Back to home
                </NebulaButton>
            </div>
        </div>
    );
}
