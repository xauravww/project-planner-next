"use client";

import { PenLine, Share2, ArrowRightToLine } from "lucide-react";
import { Section, Container } from "@/components/ui/Section";

const items = [
    {
        icon: PenLine,
        title: "Plan in plain language",
        body: "Describe the idea in words. The AI structures it for you.",
    },
    {
        icon: Share2,
        title: "Share with your team",
        body: "Everyone sees the same stories, architecture, and tasks.",
    },
    {
        icon: ArrowRightToLine,
        title: "Export to your tools",
        body: "Push the backlog to Linear, GitHub Issues, or your editor.",
    },
];

export function MinimalFeatures() {
    return (
        <Section>
            <Container>
                <div className="grid sm:grid-cols-3 gap-6">
                    {items.map((f) => (
                        <div key={f.title} className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)] p-6">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--r-md)] border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] mb-4">
                                <f.icon className="h-4 w-4 text-[color:var(--color-accent-blue)]" />
                            </div>
                            <h3 className="type-h3 mb-1.5">{f.title}</h3>
                            <p className="type-body">{f.body}</p>
                        </div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
