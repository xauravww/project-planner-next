"use client";

/**
 * One card shape, used by Features / Pricing / Testimonials / FAQ.
 * Tokens (surface, hairline, radius) come from globals.css — no
 * per-card overrides. Pass `interactive` for hover lift.
 */

import React from "react";
import { cn } from "@/lib/utils";

type NebulaCardProps = React.HTMLAttributes<HTMLDivElement> & {
    /** Render with a stronger hairline + slight hover lift. */
    interactive?: boolean;
    /** Mark as the highlighted card (e.g. "Most Popular" pricing). */
    highlight?: boolean;
};

export function NebulaCard({
    interactive,
    highlight,
    className,
    children,
    ...rest
}: NebulaCardProps) {
    return (
        <div
            className={cn(
                "nebula-surface relative flex flex-col p-8 transition-colors",
                interactive && "hover:border-[var(--color-nebula-hairline-strong)]",
                highlight && "border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)]/80",
                className,
            )}
            style={{
                transitionDuration: "var(--nebula-fast)",
                transitionTimingFunction: "var(--nebula-ease)",
            }}
            {...rest}
        >
            {children}
        </div>
    );
}
