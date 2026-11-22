"use client";

import { Layers, Zap, Shield, Users, Cpu, GitBranch, type LucideIcon } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type Feature = {
    title: string;
    description: string;
    icon: LucideIcon;
    /** Tailwind grid span — controls bento layout */
    span: string;
    /** A mini visual block shown inside the card. */
    visual: React.ReactNode;
};

const features: Feature[] = [
    {
        title: "Modular architecture",
        description: "Drag, drop, and connect components to plan scalable systems before you write a line of code.",
        icon: Layers,
        span: "md:col-span-2 md:row-span-2",
        visual: (
            <div className="flex flex-wrap gap-2">
                {["Frontend", "API", "DB", "Queue"].map((t) => (
                    <span key={t} className="rounded-full border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] px-2.5 py-1 text-xs font-medium text-[color:var(--color-nebula-fg-mute)]">
                        {t}
                    </span>
                ))}
            </div>
        ),
    },
    {
        title: "Edge fast",
        description: "Zero-latency planning, anywhere you work.",
        icon: Zap,
        span: "md:col-span-2",
        visual: (
            <div className="flex items-center gap-1.5">
                {[70, 90, 60, 100, 80, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-[var(--color-accent-blue)] opacity-50" style={{ height: `${h}px` }} />
                ))}
            </div>
        ),
    },
    {
        title: "Team sync",
        description: "Real-time editing across timezones.",
        icon: Users,
        span: "md:col-span-2",
        visual: (
            <div className="flex -space-x-2">
                {["SC", "MR", "EW"].map((a) => (
                    <span key={a} className="h-8 w-8 rounded-full border border-[var(--color-nebula-bg)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-xs font-medium text-[color:var(--color-nebula-fg)]">
                        {a}
                    </span>
                ))}
            </div>
        ),
    },
    {
        title: "Secure by default",
        description: "Bank-grade encryption for your ideas.",
        icon: Shield,
        span: "md:col-span-2",
        visual: (
            <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--color-accent-green)]">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent-green)]" />
                Encrypted at rest
            </div>
        ),
    },
    {
        title: "AI suggestions",
        description: "Smart picks for your stack and structure.",
        icon: Cpu,
        span: "md:col-span-2",
        visual: (
            <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-blue)]" />
                    <span className="text-xs font-medium text-[color:var(--color-nebula-fg)]">Next.js + Postgres</span>
                </div>
                <div className="rounded-md border border-[var(--color-accent-blue)] bg-[var(--color-accent-blue-glow)] px-2.5 py-1.5">
                    <span className="text-xs font-medium text-[color:var(--color-accent-blue)]">Suggested stack</span>
                </div>
            </div>
        ),
    },
    {
        title: "Git native",
        description: "Plans sync with your repo. Code and spec stay in step.",
        icon: GitBranch,
        span: "md:col-span-4",
        visual: (
            <div className="flex items-center gap-3">
                <span className="rounded-md border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] px-2.5 py-1 font-mono text-xs text-[color:var(--color-nebula-fg-mute)]">
                    git push
                </span>
                <span className="h-px flex-1 bg-[var(--color-nebula-hairline-strong)]" />
                <span className="rounded-md border border-[var(--color-accent-green)] bg-[var(--color-accent-green-glow)] px-2.5 py-1 font-mono text-xs text-[color:var(--color-accent-green)]">
                    spec synced
                </span>
            </div>
        ),
    },
];

export function Features() {
    return (
        <Section id="features" glow="slate" fill>
            <Container>
                <SectionHeader
                    title="Everything you need to"
                    accent="ship faster"
                    subtitle="A small set of sharp tools that take you from idea to working code, without busywork."
                />

                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[auto] gap-4">
                    {features.map((f) => (
                        <div key={f.title} className={cn(f.span, "min-h-[180px]")}>
                            <div className="h-full flex flex-col justify-between gap-5 rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-5 transition-colors hover:border-[var(--color-nebula-fg)]">
                                <div className="space-y-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--r-md)] border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)]">
                                        <f.icon className="h-4 w-4 text-[color:var(--color-accent-blue)]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h3 className="type-h3">{f.title}</h3>
                                        <p className="type-body">{f.description}</p>
                                    </div>
                                </div>
                                <div>{f.visual}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
