"use client";

/**
 * Landing-page primitives. Every section uses these — no section
 * styles its own background, padding, type, or hairlines. All
 * tokens live in globals.css (`@theme` + .nebula-* utilities).
 *
 *   <Section>            ← bg, vertical rhythm, constellation backdrop
 *     <Container>        ← centered max-width
 *       <SectionHeader/> ← eyebrow + serif title + body subtitle
 *       …body…
 *     </Container>
 *   </Section>
 */

import React from "react";
import { cn } from "@/lib/utils";

/* ---------- Section ---------- */

type SectionProps = {
    id?: string;
    /** Drop the constellation grid + glow backdrop. */
    plain?: boolean;
    className?: string;
    children: React.ReactNode;
};

export function Section({ id, plain, className, children }: SectionProps) {
    return (
        <section
            id={id}
            className={cn(
                "relative overflow-hidden",
                // bg + vertical rhythm from tokens
                "bg-[var(--color-nebula-bg)]",
                "py-[var(--nebula-section-y)]",
                !plain && "nebula-backdrop",
                className,
            )}
        >
            {children}
        </section>
    );
}

/* ---------- Container ---------- */

export function Container({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("container mx-auto px-6 relative z-10", className)}>
            {children}
        </div>
    );
}

/* ---------- Eyebrow ---------- */

export function Eyebrow({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("inline-flex items-center gap-3 type-eyebrow", className)}>
            <span
                aria-hidden
                className="inline-block w-6 h-px bg-[var(--color-nebula-hairline-strong)]"
            />
            {children}
        </div>
    );
}

/* ---------- SectionHeader ---------- */

type SectionHeaderProps = {
    eyebrow?: string;
    title: React.ReactNode;
    /** Italic-serif word emphasised after the title. */
    accent?: string;
    subtitle?: string;
    align?: "center" | "left";
    className?: string;
};

export function SectionHeader({
    eyebrow,
    title,
    accent,
    subtitle,
    align = "center",
    className,
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                "max-w-3xl mb-[var(--nebula-stack-lg)] space-y-[var(--nebula-stack-md)]",
                align === "center" ? "mx-auto text-center" : "text-left",
                className,
            )}
        >
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}

            <h2 className="type-h2">
                {title}
                {accent ? (
                    <>
                        {" "}
                        <em className="type-italic-accent">{accent}</em>
                    </>
                ) : null}
            </h2>

            {subtitle ? <p className="type-body max-w-2xl mx-auto">{subtitle}</p> : null}
        </div>
    );
}
