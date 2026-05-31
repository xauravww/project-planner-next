"use client";

/**
 * Shared auth-page frame: pure-black canvas, back-link, centered
 * card with title + subtitle. Login / signup / auth-error all
 * compose this — no per-page layout duplication.
 */

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NebulaCard } from "@/components/ui/NebulaCard";

type AuthShellProps = {
    title: string;
    subtitle?: string;
    /** Footer row under the card (e.g. "Don't have an account? Sign up"). */
    footer?: React.ReactNode;
    children: React.ReactNode;
};

export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-nebula-bg)]">
            <Link
                href="/"
                className="mb-8 inline-flex items-center gap-2 type-small text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to home
            </Link>

            <NebulaCard className="w-full max-w-md gap-[var(--space-xl)]">
                <div className="text-center space-y-2">
                    <h1 className="type-h2 text-[length:var(--nebula-h3)]">{title}</h1>
                    {subtitle ? <p className="type-small">{subtitle}</p> : null}
                </div>

                {children}

                {footer ? (
                    <div className="text-center type-small">{footer}</div>
                ) : null}
            </NebulaCard>
        </div>
    );
}

/** Inline error line for forms. */
export function FormError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="type-small text-center text-[color:var(--color-accent-red)]">{message}</p>
    );
}
