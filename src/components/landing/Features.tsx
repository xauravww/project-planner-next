"use client";

import { motion } from "framer-motion";
import { Layers, Zap, Shield, Globe, Cpu, GitBranch, type LucideIcon } from "lucide-react";
import { Section, Container, SectionHeader } from "@/components/ui/Section";
import { NebulaCard } from "@/components/ui/NebulaCard";

type Feature = {
    title: string;
    description: string;
    icon: LucideIcon;
    /** Tailwind grid span — controls bento layout */
    span: string;
};

const features: Feature[] = [
    {
        title: "Modular architecture",
        description: "Drag, drop, and connect components to plan scalable systems before you write a line of code.",
        icon: Layers,
        span: "md:col-span-2 md:row-span-2", // hero tile
    },
    {
        title: "Edge fast",
        description: "Zero-latency planning, anywhere you work.",
        icon: Zap,
        span: "md:col-span-2",
    },
    {
        title: "Global sync",
        description: "Real-time team editing across timezones.",
        icon: Globe,
        span: "md:col-span-2",
    },
    {
        title: "Secure by default",
        description: "Bank-grade encryption for your ideas.",
        icon: Shield,
        span: "md:col-span-2",
    },
    {
        title: "AI suggestions",
        description: "Smart picks for your stack and structure.",
        icon: Cpu,
        span: "md:col-span-2",
    },
    {
        title: "Git native",
        description: "Plans sync with your repo. Code and spec stay in step.",
        icon: GitBranch,
        span: "md:col-span-4",
    },
];

export function Features() {
    return (
        <Section id="features">
            <Container>
                <SectionHeader
                    title="Everything you need to"
                    accent="ship faster"
                    subtitle="A small set of sharp tools that take you from idea to working code, without busywork."
                />

                {/* 4-col bento — first tile is 2×2, rest fill in */}
                <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[180px] gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className={f.span}
                        >
                            <NebulaCard interactive className="h-full justify-between gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--nebula-radius-sm)] nebula-hairline">
                                        <f.icon className="h-4 w-4 text-[color:var(--color-nebula-fg)]" />
                                    </div>
                                    <span className="type-eyebrow text-[0.6rem] opacity-50">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="type-h3">{f.title}</h3>
                                    <p className="type-small">{f.description}</p>
                                </div>
                            </NebulaCard>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </Section>
    );
}
