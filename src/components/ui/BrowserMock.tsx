"use client";

/**
 * Reusable browser-window frame. Used by Demo section and anywhere
 * we want to show product UI in context. Composes nebula tokens —
 * never hardcodes colors. Drop any children inside the viewport.
 */

import React from "react";
import { cn } from "@/lib/utils";

type BrowserMockProps = {
    url?: string;
    className?: string;
    children: React.ReactNode;
};

export function BrowserMock({ url = "nebulaplan.app", className, children }: BrowserMockProps) {
    return (
        <div
            className={cn(
                "nebula-surface overflow-hidden shadow-2xl",
                className,
            )}
        >
            {/* chrome */}
            <div className="flex items-center gap-3 px-4 py-3 nebula-hairline-b bg-[var(--color-nebula-bg)]/60">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-nebula-fg-mute)] opacity-50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-nebula-fg-mute)] opacity-50" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-nebula-fg-mute)] opacity-50" />
                </div>
                <div className="flex-1 mx-4">
                    <div className="text-xs text-[color:var(--color-nebula-fg-mute)] text-center font-mono">
                        {url}
                    </div>
                </div>
                <div className="w-12" />
            </div>
            {/* viewport */}
            <div className="bg-[var(--color-nebula-bg)]">{children}</div>
        </div>
    );
}
