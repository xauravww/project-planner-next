"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PRIORITY = ["must-have", "should-have", "nice-to-have"];
const PRIORITY_LABEL: Record<string, string> = {
    "must-have": "Must have",
    "should-have": "Should have",
    "nice-to-have": "Nice to have",
};
const PRIORITY_COLOR: Record<string, string> = {
    "must-have": "#FF4D00",
    "should-have": "#2563EB",
    "nice-to-have": "#16A34A",
};

function categoryOf(content: string): string | null {
    const m = content.match(/^Category:\s*(.+)$/m);
    return m ? m[1].trim() : null;
}

export default function RequirementsMap({ projectId, requirements }: { projectId: string; requirements: any[] }) {
    const stats = useMemo(() => {
        const total = requirements.length;
        const byPriority = PRIORITY.map((p) => ({
            key: p,
            label: PRIORITY_LABEL[p],
            color: PRIORITY_COLOR[p],
            count: requirements.filter((r) => r.priority === p).length,
        }));
        const catMap = new Map<string, number>();
        requirements.forEach((r) => {
            const c = categoryOf(r.content) ?? "Uncategorized";
            catMap.set(c, (catMap.get(c) || 0) + 1);
        });
        const categories = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);
        const functional = requirements.filter((r) => r.type === "functional").length;
        return { total, byPriority, categories, functional, nonFunctional: total - functional };
    }, [requirements]);

    if (requirements.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No requirements yet.</p>
                <Link href={`/projects/${projectId}/refine`} className="nebula-btn nebula-btn--primary mt-6 justify-center">
                    Plan more
                </Link>
            </div>
        );
    }

    const maxCat = Math.max(...stats.categories.map(([, c]) => c), 1);

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/requirements`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} requirements</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {stats.byPriority.map((p) => (
                            <div key={p.key} className="border-2 border-black p-3">
                                <div className="font-display text-3xl leading-none" style={{ color: p.color }}>{p.count}</div>
                                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">{p.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* type mix */}
                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">Type mix</div>
                        <div className="mt-3 h-3 w-full border-2 border-black overflow-hidden flex">
                            <div className="bg-black" style={{ width: `${(stats.functional / stats.total) * 100}%` }} />
                            <div className="bg-black/20" style={{ width: `${(stats.nonFunctional / stats.total) * 100}%` }} />
                        </div>
                        <div className="mt-2 flex items-center gap-4 font-mono text-[11px] uppercase tracking-tight text-black/70">
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-black" /> Functional {stats.functional}</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 bg-black/20" /> Non-functional {stats.nonFunctional}</span>
                        </div>
                    </div>

                    {/* category breakdown */}
                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">By category</div>
                        <div className="mt-3 space-y-2.5">
                            {stats.categories.map(([c, count]) => (
                                <div key={c}>
                                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-black/70">
                                        <span>{c}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full border border-black bg-black/5">
                                        <div className="h-full bg-[#FF4D00]" style={{ width: `${(count / maxCat) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/requirements`} className="nebula-btn nebula-btn--primary flex-1 justify-center">
                            View requirements
                        </Link>
                        <Link href={`/projects/${projectId}/refine`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                            Plan more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
