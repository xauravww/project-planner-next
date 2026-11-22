"use client";

import { Lightbulb, PenTool, Rocket, type LucideIcon } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/Section";

type Step = {
    icon: LucideIcon;
    title: string;
    description: string;
};

const steps: Step[] = [
    {
        icon: Lightbulb,
        title: "Start with an idea",
        description: "Drop in your rough thoughts. The AI helps shape them into clear user stories you can ship from.",
    },
    {
        icon: PenTool,
        title: "Design the structure",
        description: "Map out modules, flows, and data shapes. See the whole system before you write code.",
    },
    {
        icon: Rocket,
        title: "Ship the work",
        description: "Export tasks and scaffolding straight into your tools. Start coding the same day.",
    },
];

export function HowItWorks() {
    return (
        <Section id="how" glow="green" fill>
            <Container>
                <SectionHeader
                    title="From idea to"
                    accent="shipped"
                    subtitle="Three steps. No setup. No clutter."
                    align="left"
                />

                <div className="grid lg:grid-cols-5 gap-12 items-center">
                    <div className="lg:col-span-3">
                        <ol className="relative">
                            {/* vertical hairline running the length of the list */}
                            <span
                                aria-hidden
                                className="absolute left-[2.5rem] top-2 bottom-2 w-px bg-[var(--color-nebula-hairline)] hidden md:block"
                            />

                            {steps.map((step, i) => (
                                <li
                                    key={step.title}
                                    className="relative flex gap-6 md:gap-12 py-10 first:pt-0 last:pb-0 list-none"
                                >
                                    {/* oversized number */}
                                    <div className="shrink-0 w-20 md:w-20 flex flex-col items-start">
                                        <span
                                            aria-hidden
                                            className="text-[color:var(--color-accent-blue)]"
                                            style={{
                                                fontFamily: "var(--font-sans), 'Inter', sans-serif",
                                                fontWeight: 700,
                                                fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                                                lineHeight: 1,
                                                letterSpacing: "-0.03em",
                                            }}
                                        >
                                            {`0${i + 1}`}
                                        </span>
                                        <span className="mt-2 hidden md:inline-block w-10 h-px bg-[var(--color-nebula-hairline-strong)]" />
                                    </div>

                                    <div className="flex-1 space-y-3 pt-2">
                                        <div className="flex items-center gap-3">
                                            <step.icon className="w-4 h-4 text-[color:var(--color-nebula-fg-mute)]" />
                                            <h3 className="type-h3">{step.title}</h3>
                                        </div>
                                        <p className="type-body-lg max-w-xl">{step.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* visual column */}
                    <div className="hidden lg:block lg:col-span-2">
                        <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="h-3 w-20 rounded bg-[var(--color-nebula-hairline)]" />
                                <div className="h-6 w-6 rounded-full bg-[var(--color-accent-green)] opacity-60" />
                            </div>
                            <div className="space-y-2">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-nebula-bg)] p-2.5">
                                        <div className="h-3.5 w-3.5 shrink-0 rounded bg-[var(--color-accent-blue)] opacity-60" />
                                        <div className="h-2 flex-1 rounded bg-[var(--color-nebula-hairline)]" />
                                    </div>
                                ))}
                            </div>
                            <div className="h-2.5 rounded bg-[var(--color-nebula-hairline)] w-2/3" />
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
