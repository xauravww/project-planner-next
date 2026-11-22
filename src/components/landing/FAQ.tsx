"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, Container, SectionHeader } from "@/components/ui/Section";
import { NebulaCard } from "@/components/ui/NebulaCard";

type QA = { question: string; answer: string };

const faqs: QA[] = [
    {
        question: "How does the AI planning work?",
        answer: "We read your high-level idea and break it into user stories, tech requirements, and data shapes using language models trained on software architecture.",
    },
    {
        question: "Can I export my plan?",
        answer: "Yes. Export to PDF, Markdown, or sync straight to Jira, Linear, or GitHub Issues.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes. We encrypt data at rest and in transit. Your work stays yours.",
    },
    {
        question: "Do you offer team collaboration?",
        answer: "Pro and Enterprise plans support real-time editing and comments across your team.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <Section id="faq" fill>
            <Container>
                <SectionHeader
                    title="Frequently"
                    accent="asked"
                />

                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    {/* visual column */}
                    <div className="hidden lg:block">
                        <div className="rounded-2xl border border-[var(--color-nebula-hairline-strong)] bg-[var(--color-surface-elevated)] p-5 space-y-3">
                            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-nebula-bg)] p-2.5">
                                <div className="h-3.5 w-3.5 shrink-0 rounded bg-[var(--color-accent-green)] opacity-60" />
                                <div className="h-2 flex-1 rounded bg-[var(--color-nebula-hairline)]" />
                            </div>
                            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-nebula-bg)] p-2.5">
                                <div className="h-3.5 w-3.5 shrink-0 rounded bg-[var(--color-accent-blue)] opacity-60" />
                                <div className="h-2 flex-1 rounded bg-[var(--color-nebula-hairline)]" />
                            </div>
                            <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-nebula-hairline)] bg-[var(--color-nebula-bg)] p-2.5">
                                <div className="h-3.5 w-3.5 shrink-0 rounded bg-[var(--color-accent-green)] opacity-60" />
                                <div className="h-2 flex-1 rounded bg-[var(--color-nebula-hairline)]" />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-[var(--space-md)]">
                    {faqs.map((faq, i) => {
                        const open = openIndex === i;
                        return (
                            <NebulaCard
                                key={faq.question}
                                interactive
                                className="!p-0 cursor-pointer"
                                onClick={() => setOpenIndex(open ? null : i)}
                            >
                                <button
                                    type="button"
                                    aria-expanded={open}
                                    className="flex items-center justify-between gap-4 p-6 text-left w-full"
                                >
                                    <span className="type-h3 text-base md:text-lg">{faq.question}</span>
                                    {open
                                        ? <Minus className="w-4 h-4 text-[color:var(--color-nebula-fg)] shrink-0" />
                                        : <Plus className="w-4 h-4 text-[color:var(--color-nebula-fg-mute)] shrink-0" />}
                                </button>

                                <AnimatePresence initial={false}>
                                    {open && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 type-small nebula-hairline-t pt-4">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </NebulaCard>
                        );
                    })}
                    </div>
                </div>
            </Container>
        </Section>
    );
}
