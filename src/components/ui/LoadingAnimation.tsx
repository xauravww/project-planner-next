"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const loadingMessages = [
    "🎨 Analyzing your prompt...",
    "✨ Crafting the perfect layout...",
    "🎯 Choosing colors & typography...",
    "💫 Adding micro-interactions...",
    "🔮 Applying design principles...",
    "🎪 Implementing accessibility...",
    "⚡ Optimizing responsiveness...",
    "🌟 Polishing the details...",
    "🚀 Almost there...",
];

export function LoadingAnimation() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-16">
            {/* Animated icon */}
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-spin-slow">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
            </div>

            {/* Animated message */}
            <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Generating Your UI</h3>
                <p
                    key={messageIndex}
                    className="text-gray-300 text-lg font-medium animate-fade-in"
                >
                    {loadingMessages[messageIndex]}
                </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    );
}
