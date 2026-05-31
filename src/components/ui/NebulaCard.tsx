"use client";

/**
 * Feature/pricing/email card — Resend `feature-card` shape:
 *  - `surface-card` bg
 *  - 1px translucent-white hairline (strong)
 *  - 12px radius (`--r-lg`)
 *  - 32px internal padding (`--space-xxl`)
 *
 *  Variants:
 *  - default        plain card
 *  - elevated       featured tier (`surface-elevated`)
 *  - deep           code well (`surface-deep`)
 *  - interactive    hover lift (border brightens)
 */

import React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "elevated" | "deep";

type NebulaCardProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: Variant;
    interactive?: boolean;
    /** Back-compat: highlight === elevated */
    highlight?: boolean;
};

export function NebulaCard({
    variant,
    highlight,
    interactive,
    className,
    children,
    ...rest
}: NebulaCardProps) {
    const v: Variant = variant ?? (highlight ? "elevated" : "default");

    return (
        <div
            className={cn(
                "relative flex flex-col p-[var(--space-xxl)]",
                "rounded-[var(--r-lg)] border",
                v === "default"  && "bg-[var(--color-nebula-surface)] border-[var(--color-nebula-hairline-strong)]",
                v === "elevated" && "bg-[var(--color-surface-elevated)] border-[var(--color-nebula-hairline-strong)]",
                v === "deep"     && "bg-[var(--color-surface-deep)] border-[var(--color-nebula-hairline-strong)]",
                interactive && "transition-colors hover:border-[color:var(--color-nebula-fg)]",
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
