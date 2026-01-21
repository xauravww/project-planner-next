"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        question: "How does the AI planning work?",
        answer: "Our AI analyzes your high-level idea and breaks it down into user stories, technical requirements, and database schemas using advanced LLMs trained on software architecture best practices.",
    },
    {
        question: "Can I export my project plan?",
        answer: "Yes! You can export your entire project plan as a PDF, Markdown, or even sync it directly to Jira, Linear, or GitHub Issues.",
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use enterprise-grade encryption for all data at rest and in transit. Your intellectual property is yours alone.",
    },
    {
        question: "Do you offer team collaboration?",
        answer: "Yes, our Pro and Enterprise plans support real-time collaboration, allowing your entire team to edit and comment on plans simultaneously.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
                        Frequently Asked <span className="text-gradient">Questions</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <GlassCard
                            key={index}
                            className="p-0 overflow-hidden cursor-pointer"
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        >
                            <div className="p-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                                <div className="text-blue-400">
                                    {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                            </div>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-muted-foreground border-t border-white/5 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
