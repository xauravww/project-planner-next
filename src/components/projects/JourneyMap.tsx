"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const stepsOf = (j: any): string[] => {
    if (typeof j.steps === "string") {
        try {
            const parsed = JSON.parse(j.steps);
            if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
            // ignore
        }
        return j.steps.split("\n").map((s: string) => s.trim()).filter(Boolean);
    }
    return Array.isArray(j.steps) ? j.steps.map(String) : [];
};

export default function JourneyMap({ projectId, journeys }: { projectId: string; journeys: any[] }) {
    const stats = useMemo(() => {
        const total = journeys.length;
        const steps = journeys.flatMap((j) => stepsOf(j));
        return { total, steps: steps.length, avg: total ? Math.round((steps.length / total) * 10) / 10 : 0 };
    }, [journeys]);

    if (journeys.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No journeys yet.</p>
                <Link href={`/projects/${projectId}/journeys/generate`} className="nebula-btn nebula-btn--primary mt-6 justify-center">
                    Generate journeys
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/journeys`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} journeys</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.total}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Journeys</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.steps}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Steps</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.avg}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Avg</div>
                        </div>
                    </div>

                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">Journeys</div>
                        <div className="mt-3 space-y-2">
                            {journeys.map((j) => (
                                <div key={j.id} className="flex items-center justify-between gap-3 border-b border-black/10 pb-2 last:border-0 last:pb-0">
                                    <span className="font-medium text-black">{j.title}</span>
                                    <span className="font-mono text-[11px] uppercase tracking-tight text-black/50">{stepsOf(j).length} steps</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/journeys`} className="nebula-btn nebula-btn--primary flex-1 justify-center">View journeys</Link>
                        <Link href={`/projects/${projectId}/journeys/generate`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">Generate more</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
