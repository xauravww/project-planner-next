"use client";

import { ArrowUpRight } from "lucide-react";

function CardFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 bg-[#FF4D00]" />
                    <span className="h-2 w-14 bg-black" />
                </div>
            </div>
            {children}
        </div>
    );
}

function RequirementsMock() {
    return (
        <CardFrame>
            <div className="p-3">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-black">Requirements</span>
                    <span className="border border-black px-1.5 text-[9px] font-mono uppercase text-black">4</span>
                </div>
                <div className="space-y-1.5">
                    {["Authentication", "Payments", "Core"].map((t, i) => (
                        <div key={t} className="flex items-center gap-1.5 border border-black px-2 py-1">
                            <span className="font-mono text-[9px] text-[#FF4D00]">0{i + 1}</span>
                            <span className="text-[10px] font-semibold text-black">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
        </CardFrame>
    );
}

function ArchitectureMock() {
    return (
        <CardFrame>
            <div className="p-3">
                <div className="mb-2 text-[10px] font-bold uppercase text-black">Architecture</div>
                <div className="flex items-center justify-center gap-2">
                    <span className="grid h-10 w-10 place-items-center border-2 border-black text-[9px] font-bold text-black">UI</span>
                    <span className="h-0.5 w-6 bg-black" />
                    <span className="grid h-10 w-10 place-items-center border-2 border-black text-[9px] font-bold text-black">API</span>
                    <span className="h-0.5 w-6 bg-black" />
                    <span className="grid h-10 w-10 place-items-center border-2 border-black bg-[#FF4D00] text-[9px] font-bold text-white">DB</span>
                </div>
            </div>
        </CardFrame>
    );
}

function StoriesMock() {
    return (
        <CardFrame>
            <div className="p-3">
                <div className="mb-2 text-[10px] font-bold uppercase text-black">User stories</div>
                <div className="space-y-1.5">
                    {["As a user…", "So that…"].map((t) => (
                        <div key={t} className="flex items-center gap-1.5 border border-black px-2 py-1">
                            <span className="h-1.5 w-1.5 bg-[#FF4D00]" />
                            <span className="text-[10px] text-black/70">{t}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-1.5 border border-black px-2 py-1">
                        <span className="h-1.5 w-1.5 bg-black" />
                        <span className="text-[10px] text-black/70">Acceptance…</span>
                    </div>
                </div>
            </div>
        </CardFrame>
    );
}

function WorkflowsMock() {
    return (
        <CardFrame>
            <div className="p-3">
                <div className="mb-2 text-[10px] font-bold uppercase text-black">Workflows</div>
                <div className="flex items-center justify-center gap-1.5">
                    <span className="border border-black px-2 py-1 text-[9px] font-mono uppercase text-black">New</span>
                    <span className="h-0.5 w-4 bg-black" />
                    <span className="border border-black px-2 py-1 text-[9px] font-mono uppercase text-black">Review</span>
                    <span className="h-0.5 w-4 bg-black" />
                    <span className="border border-black bg-black px-2 py-1 text-[9px] font-mono uppercase text-white">Done</span>
                </div>
            </div>
        </CardFrame>
    );
}

const FEATURES = [
    {
        n: "01",
        title: "Requirements",
        mock: <RequirementsMock />,
        body: "Functional and non-functional requirements with type and priority.",
        tags: ["AI", "Functional", "Priority"],
    },
    {
        n: "02",
        title: "User stories",
        mock: <StoriesMock />,
        body: "Clear, shippable user stories your team can act on.",
        tags: ["AI", "Stories"],
    },
    {
        n: "03",
        title: "Architecture",
        mock: <ArchitectureMock />,
        body: "System design with modules, edges, and HLD/LLD diagrams.",
        tags: ["HLD", "LLD"],
    },
    {
        n: "04",
        title: "Workflows",
        mock: <WorkflowsMock />,
        body: "Auto-generated workflows and a task backlog with exports.",
        tags: ["Workflows", "Tasks"],
    },
];

export function KineticFeatures() {
    return (
        <section id="work" className="bg-white text-black pt-10 pb-10">
            <div className="container mx-auto px-4 max-w-[1400px]">
                <div className="mb-8 border-b-2 border-black pb-4">
                    <h2 className="type-display-xl text-[length:clamp(2rem,7vw,5rem)]">
                        What it does
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map((f) => (
                        <div
                            key={f.n}
                            className="group flex flex-col border-2 border-black bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#000]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-[#FF4D00]">{f.n}</span>
                                <ArrowUpRight className="h-4 w-4 text-black opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>

                            <div className="mt-3">{f.mock}</div>

                            <h3 className="type-h3 mt-4 text-[length:clamp(1rem,2.5vw,1.5rem)]">
                                {f.title}
                            </h3>
                            <p className="mt-1.5 flex-1 text-sm text-black/70">
                                {f.body}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {f.tags.map((t) => (
                                    <span key={t} className="rounded-full border border-black px-2 py-0.5 font-mono text-[11px] uppercase text-black/80">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <span
                        className="rotate-2 text-2xl text-black/70"
                        style={{ fontFamily: "var(--font-hand)" }}
                    >
                        …and many more
                    </span>
                </div>
            </div>
        </section>
    );
}
