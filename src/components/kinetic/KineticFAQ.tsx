"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
    {
        q: "Is NebulaPlan really free?",
        a: "Yes. Pro is free for a limited time, so you can use all modules without paying right now.",
    },
    {
        q: "How does the AI generation work?",
        a: "You describe the project, and NebulaPlan turns it into requirements, user stories, architecture, and a task backlog.",
    },
    {
        q: "Can I export the plan?",
        a: "Yes, the backlog and plan can be exported to your tools.",
    },
    {
        q: "What is a project?",
        a: "A project is a single idea or product you are planning, with its own generated artifacts.",
    },
];

export function KineticFAQ() {
    const [open, setOpen] = useState(0);

    return (
        <section id="faq" className="bg-white pt-14 pb-10">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <h2 className="type-display-xl text-[length:clamp(2rem,7vw,5rem)]">FAQ</h2>
                </div>

                <div className="mx-auto max-w-2xl">
                    {FAQS.map((f, i) => (
                        <div key={i} className="border-b-2 border-black">
                            <button
                                type="button"
                                onClick={() => setOpen(open === i ? -1 : i)}
                                aria-expanded={open === i}
                                className="flex w-full items-center justify-between py-4 text-left"
                            >
                                <span className="font-semibold text-black">{f.q}</span>
                                <Plus className={`h-4 w-4 shrink-0 text-black transition-transform ${open === i ? "rotate-45" : ""}`} />
                            </button>
                            {open === i && (
                                <p className="pb-4 text-sm text-black/80">{f.a}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
