"use client";

import Link from "next/link";
import React from "react";
import { cn } from "@/lib/utils";

/**
 * Single source of truth for every button/link-that-looks-like-a-button.
 * Rule 2: never hand-write `nebula-btn` classes in pages — use this.
 *
 * - If `href` is given, renders a <Link> (or plain <a> for external).
 * - Otherwise renders a <button>.
 *
 * Variants map to the `nebula-btn` theme tokens.
 */
type NebulaButtonProps = {
    href?: string;
    variant?: "primary" | "ghost" | "outline";
    size?: "md" | "lg" | "sm";
    className?: string;
    children: React.ReactNode;
    type?: "button" | "submit";
    onClick?: () => void;
    "aria-label"?: string;
};

const base =
    "nebula-btn inline-flex items-center justify-center whitespace-nowrap text-center gap-2";

const variants = {
    primary: "nebula-btn--primary",
    ghost: "nebula-btn--ghost",
    outline: "nebula-btn--outline",
};

const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-7 text-sm",
};

export function NebulaButton({
    href,
    variant = "primary",
    size = "md",
    className,
    children,
    type = "button",
    onClick,
    ...rest
}: NebulaButtonProps) {
    const classes = cn(base, variants[variant], sizes[size], className);

    if (href) {
        const ext = href.startsWith("http");
        if (ext) {
            return (
                <a href={href} className={classes} {...rest}>
                    {children}
                </a>
            );
        }
        return (
            <Link href={href} className={classes} {...rest}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} className={classes} {...rest}>
            {children}
        </button>
    );
}
