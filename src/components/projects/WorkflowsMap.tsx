"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const stepsOf = (wf: any): string[] => {
    if (typeof wf.content === "string") {
        try {
            const parsed = JSON.parse(wf.content);
            if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
            // ignore
        }
        return wf.content.split("\n").map((s: string) => s.trim()).filter(Boolean);
    }
    return Array.isArray(wf.content) ? wf.content.map(String) : [];
};

export default function WorkflowsMap({ projectId, workflows }: { projectId: string; workflows: any[] }) {
    const stats = useMemo(() => {
        const total = workflows.length;
        const allSteps = workflows.flatMap((w) => stepsOf(w));
        return { total, steps: allSteps.length, avg: total ? Math.round((allSteps.length / total) * 10) / 10 : 0, withDiagram: workflows.filter((w) => w.diagram).length };
    }, [workflows]);

    if (workflows.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No workflows yet.</p>
                <Link href={`/projects/${projectId}/workflows/generate`} className="nebula-btn nebula-btn--primary mt-6 justify-center">
                    Generate workflows
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/workflows`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} workflows</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.total}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Workflows</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.steps}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Steps</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.avg}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Avg / workflow</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-[#FF4D00]">{stats.withDiagram}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">With diagram</div>
                        </div>
                    </div>

                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">Workflows</div>
                        <div className="mt-3 space-y-2">
                            {workflows.map((w) => (
                                <div key={w.id} className="flex items-center justify-between gap-3 border-b border-black/10 pb-2 last:border-0 last:pb-0">
                                    <span className="font-medium text-black">{w.title}</span>
                                    <span className="font-mono text-[11px] uppercase tracking-tight text-black/50">{stepsOf(w).length} steps</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/workflows`} className="nebula-btn nebula-btn--primary flex-1 justify-center">
                            View workflows
                        </Link>
                        <Link href={`/projects/${projectId}/workflows/generate`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                            Generate more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
