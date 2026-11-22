"use client";

import { ArrowUpRight } from "lucide-react";

const FEATURES = [
    {
        n: "01",
        title: "Requirements",
        body: "NebulaPlan writes functional and non-functional requirements from your idea, with type and priority.",
        tags: ["AI", "Functional", "Priority"],
    },
    {
        n: "02",
        title: "User stories",
        body: "It turns the plan into clear, shippable user stories your team can act on.",
        tags: ["AI", "Stories"],
    },
    {
        n: "03",
        title: "Architecture",
        body: "A system design with modules, edges, and high-level and low-level diagrams.",
        tags: ["HLD", "LLD", "Diagrams"],
    },
    {
        n: "04",
        title: "Workflows",
        body: "Auto-generated workflows and a task backlog you can export to your tools.",
        tags: ["Workflows", "Tasks", "Exports"],
    },
];

export function KineticFeatures() {
    return (
        <section id="work" className="bg-white text-black pt-10 pb-10">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="mb-6 border-b-2 border-black pb-4">
                    <h2 className="type-display-xl text-[length:clamp(2rem,7vw,5rem)]">
                        What it does
                    </h2>
                </div>

                <div>
                    {FEATURES.map((f) => (
                        <div
                            key={f.n}
                            className="group border-b-2 border-black py-4 grid grid-cols-12 gap-4 items-start transition-colors hover:bg-black/5 cursor-default"
                        >
                            <span className="col-span-2 md:col-span-1 font-mono text-[#FF4D00] text-xs">
                                {f.n}
                            </span>
                            <div className="col-span-10 md:col-span-11">
                                <div className="flex items-center gap-3">
                                    <h3 className="type-h3 text-[length:clamp(1.1rem,4vw,2.25rem)] transition-transform group-hover:translate-x-4">
                                        {f.title}
                                    </h3>
                                    <ArrowUpRight className="w-6 h-6 text-[#FF4D00] opacity-0 transition-all group-hover:opacity-100 group-hover:rotate-45" />
                                </div>
                                <p className="mt-1.5 max-w-xl text-black/70 text-sm">
                                    {f.body}
                                </p>
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {f.tags.map((t) => (
                                        <span key={t} className="rounded-full border border-black px-2.5 py-0.5 font-mono text-[11px] uppercase text-black/80">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
