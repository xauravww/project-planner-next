"use client";

import Link from "next/link";

const STEPS = [
    {
        n: "01",
        title: "Describe your idea",
        body: "Write a project name and a one-line pitch in plain words.",
    },
    {
        n: "02",
        title: "AI structures it",
        body: "NebulaPlan generates requirements, user stories, and architecture.",
    },
    {
        n: "03",
        title: "Review and ship",
        body: "Refine what matters, add more, and export the backlog to your tools.",
    },
];

export function KineticHow() {
    return (
        <section id="how" className="bg-white pt-14 pb-10">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <h2 className="type-display-xl text-[length:clamp(2rem,7vw,5rem)]">How it works</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {STEPS.map((s) => (
                        <div key={s.n} className="flex flex-col border-2 border-black bg-white p-6 transition-colors hover:bg-black/5">
                            <span className="font-mono text-2xl text-[#FF4D00]">{s.n}</span>
                            <h3 className="type-h3 mt-4">{s.title}</h3>
                            <p className="mt-2 text-sm text-black/80">{s.body}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link href="/signup" className="nebula-btn nebula-btn--primary justify-center">
                        Start free
                    </Link>
                </div>
            </div>
        </section>
    );
}
