"use client";

/**
 * Resend `code-window` — used wherever we render code.
 *
 *   <CodeWindow tabs={["index.ts","email.tsx"]} active={0}>
 *     <pre>...</pre>
 *   </CodeWindow>
 *
 * Background = surface-deep, hairline border, 3-dot traffic
 * lights at top, optional tab strip below. All visuals come
 * from tokens — never hardcode colors here.
 */

import React from "react";
import { cn } from "@/lib/utils";

type CodeWindowProps = {
    /** Optional tab labels — first tab is active unless `active` set. */
    tabs?: string[];
    active?: number;
    className?: string;
    children: React.ReactNode;
};

export function CodeWindow({ tabs, active = 0, className, children }: CodeWindowProps) {
    return (
        <div
            className={cn(
                "nebula-surface--deep overflow-hidden",
                className,
            )}
        >
            {/* traffic lights */}
            <div className="flex items-center gap-2 px-4 h-9 nebula-hairline-b">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-red)]"   aria-hidden />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-yellow)]" aria-hidden />
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)]"  aria-hidden />
            </div>

            {/* tabs (optional) */}
            {tabs && tabs.length > 0 && (
                <div className="flex items-center gap-1 px-3 pt-2 nebula-hairline-b">
                    {tabs.map((label, i) => {
                        const isActive = i === active;
                        return (
                            <span
                                key={label}
                                className={cn(
                                    "px-3 py-1.5 text-mono text-[length:var(--nebula-code)] rounded-t-[var(--r-sm)]",
                                    isActive
                                        ? "text-[color:var(--color-nebula-fg)] bg-[var(--color-nebula-surface)]"
                                        : "text-[color:var(--color-charcoal)]",
                                )}
                            >
                                {label}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* body */}
            <div className="p-[var(--space-xl)] type-code overflow-x-auto">
                {children}
            </div>
        </div>
    );
}
