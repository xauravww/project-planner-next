"use client";

import { cn } from "@/lib/utils";

interface AestheticLoaderProps {
    message?: string;
    className?: string;
}

export function AestheticLoader({ message = "Creating magic...", className }: AestheticLoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-6 py-12", className)}>
            {/* Animated orbital rings */}
            <div className="relative w-24 h-24">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin-slow" />

                {/* Middle ring */}
                <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 animate-spin-reverse" />

                {/* Inner ring */}
                <div className="absolute inset-4 rounded-full border-2 border-pink-500/40 animate-pulse" />

                {/* Center glow */}
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40 blur-xl animate-pulse" />

                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 shadow-lg shadow-indigo-500/50 animate-ping" />
                </div>
            </div>

            {/* Loading dots sequence */}
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" />
            </div>

            {/* Message with shimmer effect */}
            <div className="relative">
                <p className="text-sm font-medium text-white/90 tracking-wide">{message}</p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </div>
        </div>
    );
}

// Add this to your tailwind.config.ts if not already present:
// animation: {
//   'spin-slow': 'spin 3s linear infinite',
//   'spin-reverse': 'spin 2s linear infinite reverse',
//   'shimmer': 'shimmer 2s infinite',
// },
// keyframes: {
//   shimmer: {
//     '0%': { transform: 'translateX(-100%)' },
//     '100%': { transform: 'translateX(100%)' },
//   },
// }
