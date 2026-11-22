"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
    "must-have": "#FF4D00",
    "should-have": "#2563EB",
    "nice-to-have": "#16A34A",
};

const tokens = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const similarity = (a: string, b: string) => {
    const ta = new Set(tokens(a));
    const tb = new Set(tokens(b));
    if (!ta.size || !tb.size) return 0;
    let inter = 0;
    ta.forEach((t) => {
        if (tb.has(t)) inter++;
    });
    return inter / Math.min(ta.size, tb.size);
};
const textOf = (r: any) => `${r.title} ${typeof r.content === "string" ? r.content : ""}`;

export default function RequirementsConnections({ projectId, requirements }: { projectId: string; requirements: any[] }) {
    const withRelated = useMemo(() => {
        return requirements.map((r, i) => {
            const rel = requirements
                .map((o, j) => ({ o, j, s: i === j ? -1 : similarity(textOf(r), textOf(o)) }))
                .filter((x) => x.s > 0.25)
                .sort((a, b) => b.s - a.s)
                .slice(0, 4)
                .map((x) => ({ id: x.o.id, title: x.o.title, score: x.s }));
            return { r, rel };
        });
    }, [requirements]);

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/requirements`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{requirements.length} requirements</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-4xl">
                    <h2 className="type-h3">Connections</h2>
                    <p className="mt-1 text-sm text-black/60">Related requirements (where scope overlaps).</p>

                    <div className="mt-5 space-y-3">
                        {withRelated.map(({ r, rel }) => (
                            <div key={r.id} className="border-2 border-black p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="font-semibold text-black">{r.title}</p>
                                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PRIORITY_COLOR[r.priority] || "#000" }} />
                                </div>
                                {rel.length === 0 ? (
                                    <p className="mt-2 font-mono text-[11px] uppercase tracking-tight text-black/40">No strong connections</p>
                                ) : (
                                    <div className="mt-2.5 flex flex-wrap gap-2">
                                        {rel.map((x) => (
                                            <Link
                                                key={x.id}
                                                href={`/projects/${projectId}/requirements/new?edit=${x.id}&from=connections`}
                                                className="border-2 border-black bg-black/5 px-2.5 py-1 text-sm text-black transition-colors hover:bg-black hover:text-white"
                                            >
                                                {x.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
