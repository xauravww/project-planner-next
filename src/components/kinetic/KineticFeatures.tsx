"use client";

import { ArrowUpRight } from "lucide-react";

const FEATURES = [
    {
        n: "01",
        title: "User stories",
        body: "AI writes clear, shippable user stories from a one-line brief.",
        tags: ["Stories", "Acceptance", "Priority"],
    },
    {
        n: "02",
        title: "Architecture",
        body: "A system map with modules, edges, and data shapes. No guesswork.",
        tags: ["Modules", "Diagrams", "HLD"],
    },
    {
        n: "03",
        title: "Backlog",
        body: "A task backlog you can export straight to Linear or GitHub Issues.",
        tags: ["Tasks", "Exports", "Sync"],
    },
    {
        n: "04",
        title: "Collaboration",
        body: "Share the plan with your team and keep everyone on the same page.",
        tags: ["Team", "Review", "Comments"],
    },
];

export function KineticFeatures() {
    return (
        <section id="work" className="bg-black text-white pt-10 pb-10">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="mb-6 flex items-end justify-between border-b border-white/20 pb-4">
                    <h2 className="type-display-xl text-[length:clamp(2rem,7vw,5rem)]">
                        What it does
                    </h2>
                    <span className="font-mono text-xs uppercase text-white/60 hidden sm:block">
                        04 / capabilities
                    </span>
                </div>

                <div>
                    {FEATURES.map((f) => (
                        <div
                            key={f.n}
                            className="group border-b border-white/20 py-8 grid grid-cols-12 gap-4 items-start transition-colors hover:bg-white/5 cursor-default"
                        >
                            <span className="col-span-2 md:col-span-1 font-mono text-[#FF4D00] text-sm">
                                {f.n}
                            </span>
                            <div className="col-span-10 md:col-span-11">
                                <div className="flex items-center gap-4">
                                    <h3 className="type-h3 text-[length:clamp(1.5rem,7vw,4.5rem)] transition-transform group-hover:translate-x-4">
                                        {f.title}
                                    </h3>
                                    <ArrowUpRight className="w-8 h-8 text-[#FF4D00] opacity-0 transition-all group-hover:opacity-100 group-hover:rotate-45" />
                                </div>
                                <p className="mt-3 max-w-xl text-white/70 text-lg">
                                    {f.body}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {f.tags.map((t) => (
                                        <span key={t} className="rounded-full border border-white/30 px-3 py-1 font-mono text-xs uppercase text-white/80">
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
