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

export default function StoriesMap({ projectId, stories }: { projectId: string; stories: any[] }) {
    const stats = useMemo(() => {
        const total = stories.length;
        const byPriority = PRIORITY.map((p) => ({
            key: p,
            label: PRIORITY_LABEL[p],
            color: PRIORITY_COLOR[p],
            count: stories.filter((s) => s.priority === p).length,
        }));
        const points = stories.reduce((sum, s) => sum + (Number(s.storyPoints) || 0), 0);
        return { total, byPriority, points, avg: total ? Math.round((points / total) * 10) / 10 : 0 };
    }, [stories]);

    if (stories.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No user stories yet.</p>
                <Link href={`/projects/${projectId}/stories/generate`} className="nebula-btn nebula-btn--primary mt-6 justify-center">
                    Generate stories
                </Link>
            </div>
        );
    }

    const maxP = Math.max(...stats.byPriority.map((p) => p.count), 1);

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/stories`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} user stories</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.total}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Total</div>
                        </div>
                        {stats.byPriority.map((p) => (
                            <div key={p.key} className="border-2 border-black p-3">
                                <div className="font-display text-3xl leading-none" style={{ color: p.color }}>{p.count}</div>
                                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">{p.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Points summary */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="border-2 border-black p-4">
                            <div className="font-display text-3xl leading-none text-black">{stats.points}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Total points</div>
                        </div>
                        <div className="border-2 border-black p-4">
                            <div className="font-display text-3xl leading-none text-black">{stats.avg}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Avg / story</div>
                        </div>
                    </div>

                    {/* By priority bar */}
                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">By priority</div>
                        <div className="mt-3 space-y-3">
                            {stats.byPriority.map((p) => (
                                <div key={p.key}>
                                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-black/70">
                                        <span>{p.label}</span>
                                        <span>{p.count}</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full border border-black bg-black/5">
                                        <div className="h-full" style={{ background: p.color, width: `${(p.count / maxP) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/stories`} className="nebula-btn nebula-btn--primary flex-1 justify-center">
                            View stories
                        </Link>
                        <Link href={`/projects/${projectId}/stories/generate`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                            Generate more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
