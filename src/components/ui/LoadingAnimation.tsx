"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const loadingMessages = [
    "Analyzing your prompt...",
    "Crafting the perfect layout...",
    "Choosing colors & typography...",
    "Adding micro-interactions...",
    "Applying design principles...",
    "Implementing accessibility...",
    "Optimizing responsiveness...",
    "Polishing the details...",
    "Almost there...",
];

export function LoadingAnimation() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-16">
            {/* Animated icon — single accent */}
            <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-accent-orange-glow)] rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-[var(--color-accent-orange)] flex items-center justify-center animate-spin-slow">
                    <Sparkles className="w-10 h-10 text-[color:var(--color-nebula-bg)]" />
                </div>
            </div>

            {/* Animated message */}
            <div className="text-center space-y-2">
                <h3 className="type-h3 text-[color:var(--color-nebula-fg)]">Generating Your UI</h3>
                <p
                    key={messageIndex}
                    className="type-body-lg text-[color:var(--color-charcoal)] animate-fade-in"
                >
                    {loadingMessages[messageIndex]}
                </p>
            </div>

            {/* Calm pulse dots instead of bounce */}
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)]/60 animate-pulse [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)]/80 animate-pulse [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-orange)] animate-pulse" />
            </div>
        </div>
    );
}