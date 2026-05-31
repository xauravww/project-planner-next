"use client";

import { motion } from "framer-motion";
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
        <Section id="how" glow="green">
            <Container className="max-w-4xl">
                <SectionHeader
                    title="From idea to"
                    accent="shipped"
                    subtitle="Three steps. No setup. No clutter."
                    align="left"
                />

                <ol className="relative">
                    {/* vertical hairline running the length of the list */}
                    <span
                        aria-hidden
                        className="absolute left-[2.5rem] top-2 bottom-2 w-px bg-[var(--color-nebula-hairline)] hidden md:block"
                    />

                    {steps.map((step, i) => (
                        <motion.li
                            key={step.title}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="relative flex gap-6 md:gap-12 py-10 first:pt-0 last:pb-0 list-none"
                        >
                            {/* oversized serif number */}
                            <div className="shrink-0 w-20 md:w-20 flex flex-col items-start">
                                <span
                                    aria-hidden
                                    className="text-[color:var(--color-nebula-fg)]"
                                    style={{
                                        fontFamily: "var(--font-serif), serif",
                                        fontWeight: 300,
                                        fontStyle: "italic",
                                        fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                                        lineHeight: 1,
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
                        </motion.li>
                    ))}
                </ol>
            </Container>
        </Section>
    );
}
