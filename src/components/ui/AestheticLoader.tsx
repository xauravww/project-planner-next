"use client";

import { cn } from "@/lib/utils";

interface AestheticLoaderProps {
    message?: string;
    className?: string;
}

export function AestheticLoader({ message = "Creating magic...", className }: AestheticLoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-6 py-12", className)}>
            {/* Animated orbital rings — single accent, no rainbow */}
            <div className="relative w-24 h-24">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-orange)]/20 animate-spin-slow" />

                {/* Middle ring */}
                <div className="absolute inset-2 rounded-full border-2 border-[var(--color-accent-orange)]/30 animate-spin-reverse" />

                {/* Inner ring */}
                <div className="absolute inset-4 rounded-full border-2 border-[var(--color-accent-orange)]/40 animate-pulse" />

                {/* Center glow */}
                <div className="absolute inset-6 rounded-full bg-[var(--color-accent-orange-glow)] blur-xl animate-pulse" />

                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[var(--color-accent-orange)] animate-pulse" />
                </div>
            </div>

            {/* Loading dots sequence — calm stagger, no bounce */}
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)]/60 animate-pulse [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)]/80 animate-pulse [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)] animate-pulse" />
            </div>

            {message && (
                <p className="text-sm text-[color:var(--color-ash)] font-medium tracking-wide animate-fade-in">
                    {message}
                </p>
            )}
        </div>
    );
}
