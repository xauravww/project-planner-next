"use client";

/**
 * Landing primitives — Resend-style.
 *
 *   <Section glow="blue">     ← canvas-black bg, vertical rhythm, optional
 *     <Container>                atmospheric glow anchored at the top
 *       <SectionHeader/>         editorial serif title + simple subtitle
 *       …body…
 *     </Container>
 *   </Section>
 *
 * No section restyles bg, padding, type, or borders — only composes
 * tokens from globals.css. Cards are rare on Resend; reach for the
 * surface tokens directly when you need depth.
 */

import React from "react";
import { cn } from "@/lib/utils";

type Glow = "blue" | "orange" | "green" | "red" | "yellow" | "slate";

/* ---------- Section ---------- */

type SectionProps = {
    id?: string;
    /** Atmospheric radial glow anchored at the top of the section. */
    glow?: Glow;
    className?: string;
    children: React.ReactNode;
};

export function Section({ id, glow, className, children }: SectionProps) {
    return (
        <section
            id={id}
            className={cn(
                "relative overflow-hidden",
                "bg-[var(--color-nebula-bg)]",
                "py-[var(--space-section)]",
                glow && "nebula-glow",
                glow && `glow-${glow}`,
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
        <div className={cn("container mx-auto px-6 max-w-[1200px] relative z-10", className)}>
            {children}
        </div>
    );
}

/* ---------- Eyebrow (rare per Resend — kept for opt-in) ---------- */

export function Eyebrow({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <span className={cn("type-eyebrow", className)}>{children}</span>;
}

/* ---------- SectionHeader ---------- */

type SectionHeaderProps = {
    eyebrow?: string;
    title: React.ReactNode;
    /** Italic-serif emphasis at end of title. */
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
    align = "left",
    className,
}: SectionHeaderProps) {
    return (
        <div
            className={cn(
                "max-w-3xl mb-[var(--space-xxxl)] space-y-[var(--space-lg)]",
                align === "center" ? "mx-auto text-center" : "text-left",
                className,
            )}
        >
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}

            <h2 className="type-display-xl text-[color:var(--color-nebula-fg)]">
                {title}
                {accent ? (
                    <>
                        {" "}
                        <em className="type-italic-accent">{accent}</em>
                    </>
                ) : null}
            </h2>

            {subtitle ? <p className="type-subtitle max-w-xl">{subtitle}</p> : null}
        </div>
    );
}
